import { EmbedBuilder} from 'discord.js';

export function createStdEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle('Title')
    .setColor(12915151)
    .setDescription('Description')
    .setTimestamp();
}
