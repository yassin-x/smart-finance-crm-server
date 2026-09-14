import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { createHash } from 'crypto';

@Injectable()
export class MetaService {
  private readonly logger = new Logger(MetaService.name);

  constructor(private readonly httpService: HttpService) {}

  private hash(value: string): string {
    return createHash('sha256')
      .update(value.trim().toLowerCase())
      .digest('hex');
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  async sendLeadEvent(lead: {
    name: string;
    phone: string;
    job: string;
    status: string;
  }) {
    const accessToken = process.env.META_ACCESS_TOKEN;

    const pixelId = process.env.META_PIXEL_ID;

    const version = process.env.META_VERSION;

    const url = `https://graph.facebook.com/${version}/${pixelId}/events`;

    const phone = this.normalizePhone(lead.phone);

    const payload = {
      data: [
        {
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'system_generated',

          user_data: {
            ph: [this.hash(phone)],
            fn: [this.hash(lead.name)],
          },

          custom_data: {
            job: lead.job,
            status: lead.status,
            value: 1,
            currency: 'EGP',
          },
        },
      ],
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          params: {
            access_token: accessToken,
          },
        }),
      );

      this.logger.log(`Meta Lead event sent successfully: ${response.status}`);
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      this.logger.error(
        'Failed to send Lead event to Meta',
        error?.response?.data ?? error,
      );

      return null;
    }
  }

  async sendQualifiedLeadEvent(lead: {
    name: string;
    phone: string;
    job: string;
  }) {
    const accessToken = process.env.META_ACCESS_TOKEN;
    const pixelId = process.env.META_PIXEL_ID;
    const version = process.env.META_VERSION;

    const url = `https://graph.facebook.com/${version}/${pixelId}/events`;

    const phone = this.normalizePhone(lead.phone);

    const payload = {
      data: [
        {
          event_name: 'QualifiedLead',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'system_generated',

          user_data: {
            ph: [this.hash(phone)],
            fn: [this.hash(lead.name)],
          },

          custom_data: {
            job: lead.job,
            status: 'QUALIFIED',
            value: 1,
            currency: 'EGP',
          },
        },
      ],
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          params: {
            access_token: accessToken,
          },
        }),
      );

      this.logger.log(
        `Meta QualifiedLead event sent successfully: ${response.status}`,
      );

      console.log(response.data);

      return response.data;
    } catch (error: any) {
      this.logger.error(
        'Failed to send QualifiedLead event to Meta',
        error?.response?.data ?? error,
      );

      return null;
    }
  }
}
