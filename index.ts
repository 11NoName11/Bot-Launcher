import chalk from "chalk";
import { Client, IntentsBitField, EmbedBuilder } from "discord.js";
import ora from "ora";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { handleCommands, registerCommands } from "./commands.js";

dotenv.config();

console.log(chalk.bold.green("Runner bot Discord by " + chalk.cyan.underline("Rahaaa_")));
console.log(chalk.bold.blue("jangan lupa follow instagram " + chalk.cyan.underline("@rahawaeh_113")));
console.log(chalk.bold(chalk.red("Ingat! Jangan bagikan token Bot Discord-mu ke siapapun!\n")));
console.log(chalk.bold("Alat ini akan membantumu mengaktifkan " + chalk.cyan.underline("Bot Discord")));
console.log(chalk.bold("Jika kamu mengalami masalah, hubungi saya di Discord: ") + chalk.cyan.underline("https://discord.com/users/1011588306724737105 "));
console.log(chalk.bold("my name in discord : ") + chalk.cyan.underline("@rahawaeh_113"));

// 🔹 Fungsi untuk validasi token
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

  const spinner = ora(chalk.bold(`Menjalankan ${label} Discord...`)).start();

  const client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
    ],
  });

  const activeAIUsers = new Map();

  async function getAIResponse(content) {
    return `Kamu bilang: ${content}`;
  }

  client.once("ready", async () => {
    spinner.succeed(chalk.bold(`Berhasil login sebagai ${chalk.cyan(client.user.tag)}!`));

    await registerCommands(client);
    ora(chalk.bold(`Gunakan / di Discord untuk melihat perintah ${label}`)).start();

    client.user.setPresence({
      activities: [{ name: "🌙Bot By @rahaa de dev✨", type: 0 }],
      status: "online",
    });

    console.log(chalk.cyan(`🌙 Status ${label} sudah diatur!`));
  });

  // ✅ Tambahan penting biar slash command jalan
  client.on("interactionCreate", async (interaction) => {
    try {
      await handleCommands(interaction);
    } catch (err) {
      console.error("❌ Error saat menangani command:", err);
    }
  });

  // ✅ Pesan welcome
  client.on("guildMemberAdd", async (member) => {
    const welcomeEmbed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle(`👋 Selamat Datang di ${member.guild.name}!`)
      .setDescription(`Halo ${member.user}, selamat datang! Semoga betah di sini 😄`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    const welcomeChannel = member.guild.channels.cache.find(
      (ch) => ch.name.toLowerCase() === "welcome" && ch.isTextBased()
    );

    if (welcomeChannel) {
      await welcomeChannel.send({
        content: `🎉 Selamat datang ${member.user} di server **${member.guild.name}**!`,
        embeds: [welcomeEmbed],
      });
    } else {
      console.log(chalk.yellow("⚠️ Channel #welcome tidak ditemukan"));
    }
  });

  // ✅ Pesan goodbye
  client.on("guildMemberRemove", async (member) => {
    const goodbyeEmbed = new EmbedBuilder()
      .setColor(0xff5555)
      .setTitle(`😢 Selamat Tinggal, ${member.user.username}!`)
      .setDescription(`👋 ${member.user} telah meninggalkan server **${member.guild.name}**.`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    const channel = member.guild.channels.cache.find(
      (ch) => ch.name.toLowerCase() === "goodbye" && ch.isTextBased()
    );

    if (channel) {
      await channel.send({ embeds: [goodbyeEmbed] });
      console.log(chalk.green(`👋 Pesan goodbye dikirim untuk ${member.user.tag}`));
    } else {
      console.log(chalk.yellow("⚠️ Channel #goodbye tidak ditemukan"));
    }
  });

  try {
    await client.login(token);
  } catch (err) {
    spinner.fail(chalk.red(`Gagal login ${label}: ${err.message}`));
  }
}

const tokens = [process.env.DISCORD_BOT_TOKEN].filter(Boolean);

if (tokens.length === 0) {
  console.error("✖ Tidak ada token ditemukan di .env");
  process.exit(1);
}

tokens.forEach((token, i) => runBot(token, `Bot ${i + 1}`));

process.on("SIGINT", () => {
  console.log("\n🛑 Menutup bot Discord dengan aman...");
  process.exit(0);
});
