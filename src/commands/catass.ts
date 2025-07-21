import Discord, {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  TextBasedChannel,
  Embed,
} from 'discord.js';

import { SlashCommand } from '../types/typedefs';

export default class Gay {
  readonly command: SlashCommand = new SlashCommandBuilder()
    .setName('gay')
    .setDescription('React to all of a user\'s messages for five minutes.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to be reacted.')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('emoji')
        .setDescription('ONE emoji to react (defaults to rainbow)')
        .setRequired(false),
    );

  async execute(interaction: ChatInputCommandInteraction) {
    const { client, options, channel} = interaction;

    const target = options.getMember('user');
    const emoji = options.getString('emoji') ?? '906028067221291009';
    const isCustom = options.getString('emoji') !== null;

    const success = new EmbedBuilder()
      .setTitle(isCustom ? 'Get reacted!' : 'Gayyyyyy')
      .setColor(12915151)
      .setDescription(`Hehe, ${options.getUser('user')} will be reacted ${isCustom ? emoji : 'gay'} for 5 minutes!`)
      //.setThumbnail(client.user.displayAvatarURL({ size: 256, extension: 'png' }))
      .setFooter({ 
        // currently broken need to rewrite the embeds to the format in report.ts
        icon_url: client.user.avatarURL(), 
        text: 'The Gayborhood', })
      .setTimestamp()

    interaction.reply({ embeds: [success]});

    const collector = channel.createMessageCollector({
      filter: (m) => m.author.id === target.id,
      time: 5 * 60 * 1000, //5 minutes
    } );

    collector.on('collect', m => {
    // Stop if user requests
      if (m.content.toLowerCase() === "gay.stop") {
        m.react('✅');
        collector.stop();
      };

      m.react(emoji);
    });
  }
}
