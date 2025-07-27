import { EmbedBuilder, Client } from 'discord.js';

export function createStdEmbed(client: Client<true>): EmbedBuilder {
    return new EmbedBuilder({
      color: 12915151,
      title: 'Default title',
      description:
        "Default description",
      timestamp: new Date(),
      footer: {
        icon_url: client.user.avatarURL(),
        text: 'The Gayborhood',
      },
    });
}

