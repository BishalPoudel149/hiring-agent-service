import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LinkedinParserService {
  private readonly webhookUrl =
    process.env.RELEVANCE_WEBHOOK_URL ||
    'https://api-f1db6c.stack.tryrelevance.com/latest/studios/c166d939-2f2e-4f02-b9b7-399b5a5eace8/trigger_webhook?project=d02a83cbf665-406d-9b2e-a5915efddda2';

  /**
   * Get user profile data from LinkedIn via the existing Relevance AI webhook.
   * Mirrors LinkedinParser.GetUserProfileData in C#.
   */
  async getUserProfileData(profileUrl: string): Promise<unknown> {
    const body = { url: profileUrl, name: '' };
    const response = await axios.post(this.webhookUrl, body, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }
}

