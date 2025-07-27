import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { createStdEmbed } from '../utils/embeds';
import { sqlGetSoHoStatus } from '../utils/os_native_glue';

export default class SoHoGet {
  readonly command = new SlashCommandBuilder()
    .setName('sohoget')
    .setDescription('Get SoHo room status');

  async execute(interaction: ChatInputCommandInteraction) {
    const stdembed = createStdEmbed(interaction.client);
    const public_success = createStdEmbed(interaction.client);
    public_success.setTitle('SoHo Get Status');

    stdembed.setTitle('SoHo Get Status');
    stdembed.setDescription(`Please wait...`);
    
    interaction.reply({
      embeds: [stdembed],
      ephemeral: true
    })
    .then( () => {
    sqlGetSoHoStatus((error, results, fields) => {
      if (error) {
        console.log('Error in SoHo status get query:', error);
        stdembed.setDescription(`Error in sqlGetSoHoStatus: ${error}`);
        interaction.followUp({
          embeds: [stdembed],
          ephemeral: false
        })
      } else {
        if (results[0].discordid !== null) {
          public_success.setDescription(
            `Room status: **${results[0].status}**\n` +
            `Set by ${results[0].discordid}\n` +
            `<t:${results[0].time}:R>`
          );
        } else {
         public_success.setDescription(
            `Room status: **${results[0].status}**\n` +
            `Set by iPad/website\n` +
            `<t:${results[0].time}:R>`
          );
        }
        interaction.followUp({
          embeds: [public_success]
        });
      }
     })
    })
  }
}
