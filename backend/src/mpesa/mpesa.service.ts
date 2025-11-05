import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MpesaService {
  private readonly consumerKey = process.env.MPESA_CONSUMER_KEY;
  private readonly consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  private readonly businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
  private readonly passkey = process.env.MPESA_PASSKEY;
  private readonly callbackUrl = process.env.MPESA_CALLBACK_URL;
  private readonly environment = process.env.MPESA_ENVIRONMENT || 'sandbox'; // sandbox or production

  private get baseUrl() {
    return this.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  /**
   * Get OAuth access token from M-Pesa
   */
  async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      return response.data.access_token;
    } catch (error) {
      console.error('Error getting M-Pesa access token:', error.response?.data || error.message);
      throw new BadRequestException('Failed to authenticate with M-Pesa');
    }
  }

  /**
   * Generate password for STK Push
   */
  private generatePassword(): { password: string; timestamp: string } {
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);
    
    const password = Buffer.from(
      `${this.businessShortCode}${this.passkey}${timestamp}`
    ).toString('base64');

    return { password, timestamp };
  }

  /**
   * Initiate STK Push (Lipa Na M-Pesa Online)
   */
  async initiateSTKPush(data: {
    phoneNumber: string;
    amount: number;
    accountReference: string;
    transactionDesc: string;
  }): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();

      // Format phone number (remove leading 0 or +, add 254)
      let formattedPhone = data.phoneNumber.replace(/\s/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      } else if (formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
      }

      const payload = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(data.amount), // M-Pesa requires integer
        PartyA: formattedPhone,
        PartyB: this.businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.callbackUrl,
        AccountReference: data.accountReference,
        TransactionDesc: data.transactionDesc,
      };

      console.log('🚀 Initiating STK Push:', { 
        phone: formattedPhone, 
        amount: payload.Amount,
        reference: data.accountReference 
      });

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ STK Push response:', response.data);

      return {
        success: true,
        merchantRequestId: response.data.MerchantRequestID,
        checkoutRequestId: response.data.CheckoutRequestID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        customerMessage: response.data.CustomerMessage,
      };
    } catch (error) {
      console.error('❌ STK Push error:', error.response?.data || error.message);
      
      if (error.response?.data) {
        throw new BadRequestException(
          error.response.data.errorMessage || 
          error.response.data.ResponseDescription ||
          'Failed to initiate M-Pesa payment'
        );
      }
      
      throw new BadRequestException('Failed to initiate M-Pesa payment');
    }
  }

  /**
   * Query STK Push transaction status
   */
  async querySTKPushStatus(checkoutRequestId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();

      const payload = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error querying STK Push status:', error.response?.data || error.message);
      throw new BadRequestException('Failed to query payment status');
    }
  }

  /**
   * Validate callback data from M-Pesa
   */
  validateCallback(callbackData: any): {
    isValid: boolean;
    resultCode: number;
    resultDesc: string;
    amount?: number;
    mpesaReceiptNumber?: string;
    transactionDate?: string;
    phoneNumber?: string;
  } {
    try {
      const resultCode = callbackData.Body?.stkCallback?.ResultCode;
      const resultDesc = callbackData.Body?.stkCallback?.ResultDesc;

      if (resultCode === 0) {
        // Success
        const callbackMetadata = callbackData.Body?.stkCallback?.CallbackMetadata?.Item || [];
        
        const amount = callbackMetadata.find((item: any) => item.Name === 'Amount')?.Value;
        const mpesaReceiptNumber = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
        const transactionDate = callbackMetadata.find((item: any) => item.Name === 'TransactionDate')?.Value;
        const phoneNumber = callbackMetadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;

        return {
          isValid: true,
          resultCode,
          resultDesc,
          amount,
          mpesaReceiptNumber,
          transactionDate,
          phoneNumber,
        };
      } else {
        // Failed or cancelled
        return {
          isValid: false,
          resultCode,
          resultDesc,
        };
      }
    } catch (error) {
      console.error('Error validating callback:', error);
      return {
        isValid: false,
        resultCode: -1,
        resultDesc: 'Invalid callback format',
      };
    }
  }
}


