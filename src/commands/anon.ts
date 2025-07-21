import dotenv from 'dotenv-extended';
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
} from 'discord.js';

dotenv.load();

const LOG_CHANNEL_ID = process.env.BOT_MESSAGES_CHANNEL_ID!;

export default class Anon {
  readonly command = new SlashCommandBuilder()
    .setName('anon')
    .setDescription('Send an anonymous message as the bot')
    .addStringOption((o) =>
      o
        .setName('message')
        .setDescription('What should I say anonymously?')
        .setRequired(true)
        .setMaxLength(2000),
    );

  async execute(interaction: ChatInputCommandInteraction) {
    const text = interaction.options.getString('message');

    const anonEmbed = new EmbedBuilder()
      .setTitle('Anonymous Message')
      .setDescription(text)
      .setFooter({ text: '— anonymous author' })
      .setTimestamp();

    const anonMsg = await interaction.channel.send({ embeds: [anonEmbed] });

    // log the anonymous message
    try {
      const url = `https://discord.com/channels/${anonMsg.guildId}/${anonMsg.channelId}/${anonMsg.id}`;

      const logChannel = (await interaction.client.channels.fetch(
        LOG_CHANNEL_ID,
      )) as TextChannel;

      if (logChannel) {
        await logChannel.send(
          `Anonymous message by <@${interaction.user.id}> → ${url}`,
        );
      }
    } catch (err) {
      console.error('Anon log failed:', err);
    }

    await interaction.reply({
      content: 'Your anonymous message has been sent!',
      ephemeral: true,
    });
  }
}