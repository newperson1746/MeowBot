import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  GuildMember,
  TextBasedChannel,
} from 'discord.js';
import { createStdEmbed } from '../utils/embeds';
import { sqlGetMcUuid, sqlWriteMcUuid } from '../utils/os_native_glue';

const LINK_CHANNEL_ID = '1219655248344256623';

export default class McLink {
  readonly command = new SlashCommandBuilder()
    .setName('mclink')
    .setDescription('Link your Discord and Minecraft user for whitelisting.')
    .setDefaultMemberPermissions(0)
    .addStringOption((o) =>
      o
        .setName('uuid')
        .setDescription(
          'Your MC UUID',
        ),
    );

  async execute(interaction: ChatInputCommandInteraction) {
    const { guild, client, options } = interaction;
    const member = interaction.member as GuildMember;

    const badchannel = createStdEmbed();
    badchannel.setTitle('Minecraft Linking');
    badchannel.setDescription(`Error! Please run this command in <#1219655248344256623>`);

    if (interaction.channel.id != LINK_CHANNEL_ID) {
      return interaction.reply({
        embeds: [badchannel]
      })
    }

    const public_success = createStdEmbed();
    public_success.setTitle('Minecraft Linking');
    public_success.setDescription(`${member.user}, your Minecraft UUID has been whitelisted on the server!`);

    const priv_progress = createStdEmbed();
    priv_progress.setTitle('Minecraft Linking');
    priv_progress.setDescription(`Please wait... executing SQL...`);

    const priv_failure = createStdEmbed();
    priv_failure.setTitle('Minecraft Linking');
    priv_failure.setDescription(`Error! Please make sure your UUID is exactly 36 characters long.`);

    const uuid = options.getString('uuid') ?? '';

    interaction.reply({
      embeds: [priv_progress],
      ephemeral: true
    })
    .then( () => {

      sqlGetMcUuid(member.id, (error, results, fields) => {
        if (error) {
          console.log('Error in sqlGetMcUuid:', error);
          priv_failure.setDescription(`Error in sqlGetMcUuid: ${error}`);
          return interaction.followUp({
            embeds: [priv_failure],
            ephemeral: true
          })
        } else {
          // User didn't supply a UUID. Let's provide them with some useful info, though
          if ( uuid.length == 0 ) {
              if ( results.length == 0 || results[0].uuid.length != 36 ) {
                priv_progress.setDescription(`${member.user}, you are not currently whitelisted. Run the command again with your uuid!`);
              } else {
                priv_progress.setDescription(`${member.user}, you are currently whitelisted with UUID: ${results[0].uuid}`);
              }

              interaction.followUp({
                embeds: [priv_progress],
                ephemeral: true
              })
          } else if (uuid.length != 36) {
            interaction.followUp({
              embeds: [priv_failure],
              ephemeral: true
            })
          } else { // UUID is of length 36, so let's update/insert into the table
            sqlWriteMcUuid(member.id, uuid, (error, result) => {
              if (error) {
                console.log('Error in sqlWriteMcUuid:', error);
                priv_failure.setDescription(`Error in sqlWriteMcUuid: ${error}`);
                interaction.followUp({
                  embeds: [priv_failure],
                  ephemeral: true
                })
              } else {
                console.log(`discord id ${member.id} (${member.user.username}) whitelists MC UUID ${uuid}`);
                interaction.followUp({
                  embeds: [public_success]
                });
              }
            });
          }
        }
      });
    });
  }
}
