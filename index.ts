import chalk from "chalk";
import { Client, IntentsBitField, EmbedBuilder, MessageFlags, Events } from "discord.js";
import ora from "ora";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { handleCommands, registerCommands } from "./commands.js";
dotenv.config(); // pastikan ini tetap di paling atas

console.log(chalk.bold.green("Runner bot Discord by " + chalk.cyan.underline("Rahaaa_")));
console.log(chalk.bold.blue("jangan lupa follow instagram " + chalk.cyan.underline("@rahawaeh_113")));
console.log(chalk.bold(chalk.red("Ingat! Jangan bagikan token Bot Discord-mu ke siapapun!\n")));
console.log(chalk.bold("Alat ini akan membantumu mengaktifkan " + chalk.cyan.underline("Bot Discord")));
console.log(chalk.bold("Jika kamu mengalami masalah, hubungi saya di Discord: ") + chalk.cyan.underline("https://discord.com/users/1011588306724737105 "));
console.log(chalk.bold("my name in discord : ") + chalk.cyan.underline("@rahawaeh_113"));

async function checkToken(value) {
  if (!value) return false;
  const res = await fetch("https://discord.com/api/v10/users/@me", {
    method: "GET",
    headers: { Authorization: `Bot ${value}` },
  });
  return res.status === 200;
}

async function runBot(token, label = "Bot") {
  if (!token) {
    console.error(`✖ Token ${label} tidak ditemukan! Pastikan sudah ada di file .env`);
    return;
  }

  const isValid = await checkToken(token);
  if (!isValid) {
    console.log(`✖ Token ${label} tidak valid!`);
    return;
  }

  console.log();
  const spinner = ora(chalk.bold(`Menjalankan ${label} Discord`)).start();

  const client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
    ],
  });

  try {
    await client.login(token);
  } catch {
    spinner.fail(chalk.bold(`Terjadi kesalahan saat login ${label}!`));
    return;
  }

  client.once("ready", async (client) => {
    spinner.succeed(chalk.bold(`Berhasil login sebagai ${chalk.cyan.underline(client.user.tag)}!`));
    console.log(
      chalk.bold.green("✔") +
      chalk.bold(
        ` Gunakan tautan ini untuk menambahkan ${label}: ` +
        chalk.cyan.italic.underline(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&scope=applications.commands%20bot\n`)
      )
    );

    await registerCommands(client);
    ora(chalk.bold(`Buka server Discord-mu dan gunakan slash (/) di ${label}`)).start();

    client.user.setPresence({
      activities: [
        {
          name: `| menjaga server rahaaa_🌙`,
          type: 3,
        },
      ],
      status: "online",
    });

    console.log(chalk.cyan(`🌙 Status ${label} sudah diatur!`));
  });

  client.on("interactionCreate", async (interaction) => {
    try {
      await handleCommands(interaction);
    } catch (err) {
      console.error(chalk.red(`⚠️ Terjadi error di ${label}:`), err);
    }
  });

  client.on("guildMemberAdd", async (member) => {
    const welcomeEmbed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle(`👋 Selamat Datang di ${member.guild.name}!`)
      .setDescription(
        `Halo ${member.user}, senang banget kamu udah join!\n\n🌟 Kami harap kamu betah di sini!\n\n📜 Jangan lupa baca peraturan server biar makin seru dan aman buat semua 😄`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `Selamat datang, ${member.user.username}! • ${member.guild.memberCount} anggota sekarang`,
        iconURL: member.guild.iconURL({ dynamic: true }),
      })
      .setTimestamp();

    try {
      await member.send({ embeds: [welcomeEmbed] });
      console.log(chalk.green(`✔ DM selamat datang dikirim ke ${member.user.tag}`));
    } catch (err) {
      console.log(chalk.red(`✖ Gagal kirim DM ke ${member.user.tag}: ${err.message}`));
    }

    const welcomeChannel =
      member.guild.channels.cache.find(
        (ch) => ch.name.toLowerCase() === "welcome" && ch.isTextBased()
      ) || null;

    if (welcomeChannel) {
      welcomeChannel.send({
        content: `🎉 Selamat datang ${member.user} di server **${member.guild.name}**!`,
        embeds: [welcomeEmbed],
      });
    }
  });

  client.on("guildMemberRemove", async (member) => {
    const goodbyeEmbed = new EmbedBuilder()
      .setColor(0xff5555)
      .setTitle(`😢 Selamat Tinggal, ${member.user.username}!`)
      .setDescription(
        `👋 ${member.user} telah meninggalkan server **${member.guild.name}**.\n` +
        `Semoga sukses di mana pun kamu berada 💫`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `${member.guild.name} • Sekarang tersisa ${member.guild.memberCount} anggota`,
        iconURL: member.guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    const channel = member.guild.channels.cache.find(
      (ch) => ch.name === "goodbye" && ch.isTextBased()
    );

    if (channel) {
      await channel.send({ embeds: [goodbyeEmbed] });
      console.log(`👋 Pesan goodbye dikirim untuk ${member.user.tag}`);
    } else {
      console.log("⚠️ Channel #goodbye tidak ditemukan!");
    }
  });
}

// === Jalankan semua token dari .env ===
const tokens = [
  process.env.DISCORD_BOT_TOKEN,
  // process.env.DISCORD_BOT_TOKEN1,
].filter(Boolean);

if (tokens.length === 0) {
  console.error("✖ Tidak ada token ditemukan di .env");
  process.exit(1);
}

tokens.forEach((token, i) => runBot(token, `Bot ${i + 1}`));

process.on("SIGINT", () => {
  console.log("\n🛑 Menutup bot Discord dengan aman...");
  process.exit(0);
});
