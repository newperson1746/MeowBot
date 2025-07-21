import dotenv from 'dotenv-extended';
import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from 'discord.js';
import { createStdEmbed } from '../utils/embeds';
import { sqlWriteSoHoStatus } from '../utils/os_native_glue';

export default class SoHoSet {
  readonly command = new SlashCommandBuilder()
    .setName('sohoset')
    .setDescription('Set SoHo room status')
    .setDefaultMemberPermissions(0n) // disabled until roles are granted
    .addStringOption((o) =>
      o
        .setName('status')
        .setDescription('Status to display in the server')
        .setRequired(true)
        .addChoices(
          { name: 'open', value: 'open' },
          { name: 'knock', value: 'knock' },
          { name: 'dnd', value: 'dnd' },
          { name: 'closed', value: 'closed' },
        ),
    );

  async execute(interaction: ChatInputCommandInteraction) {
    const status = interaction.options.getString('status');
    const member = interaction.member as GuildMember;

    const stdembed = createStdEmbed();
    stdembed.setTitle('SoHo Set Status');
    stdembed.setFooter({ 
      icon_url: interaction.client.user.avatarURL(), 
      text: 'The Gayborhood', })
    //stdembed.setThumbnail(interaction.client.user.displayAvatarURL({ size: 256, extension: 'png' }));

    const public_success = createStdEmbed();
    public_success.setTitle('SoHo Set Status');
    public_success.setDescription(
      
     `${interaction.member.user}, successfully set room status to **${status}**`
    );
    stdembed.setFooter({ 
      icon_url: interaction.client.user.avatarURL(), 
      text: 'The Gayborhood', })
    //public_success.setThumbnail(interaction.client.user.displayAvatarURL({ size: 256, extension: 'png' }));

    stdembed.setDescription(`Please wait...`);
    interaction.reply({
      embeds: [stdembed],
      ephemeral: true
    })
    .then( () => {
    sqlWriteSoHoStatus(member.toString(), status, (error, results, fields) => {
      if (error) {
	console.log('Error in SoHo status set query:', error);
        stdembed.setDescription(`Error in sqlWriteSoHoStatus: ${error}`);
        interaction.followUp({
          embeds: [stdembed],
          ephemeral: false
        })
      } else {
        interaction.followUp({
          embeds: [public_success]
        });
      }
     })
    })
  }
}
