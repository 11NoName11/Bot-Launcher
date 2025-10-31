import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

// daftar perintah slash
export async function registerCommands(client) {
    await client.application?.commands.set([
        { name: "active", description: "Dapatkan Lencana Pengembang Aktif Discord" },
        { name: "ping", description: "Cek seberapa cepat bot ini respon 🛰️" },
        {
            name: "roblox",
            description: "Cek informasi lengkap akun Roblox",
            options: [
                { name: "username", description: "Masukkan username Roblox", type: 3, required: true },
            ],
        },
        { name: "copy", description: "Menampilkan tombol copy untuk kode rahasia" },
        {
            name: "ai",
            description: "Tanya ke AI langsung di Discord",
            options: [{ name: "prompt", description: "Pertanyaan kamu", type: 3, required: true }]
        },

    ]);
}

// handler untuk semua command
export async function handleCommands(interaction) {
    if (!interaction.isCommand()) return;

    try {
        // ===== /active =====
        if (interaction.commandName === "active") {
            console.log(chalk.bold.green("Interaksi perintah /active diterima!"));
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: "Lencana Pengembang Aktif Discord",
                    iconURL: "https://cdn.discordapp.com/emojis/1040325165512396830.webp?size=64&quality=lossless",
                })
                .setTitle("Kamu berhasil menjalankan perintah slash!")
                .setColor("#34DB98")
                .setDescription(
                    "- Buka *https://discord.com/developers/active-developer* dan klaim lencanamu\n- Proses verifikasi bisa memakan waktu hingga 24 jam"
                )
                .setFooter({
                    text: "Dibuat oleh @rahawaeh_113",
                    iconURL: "https://cdn.discordapp.com/emojis/1040325165512396830.webp?size=64&quality=lossless",
                });
            await interaction.reply({ embeds: [embed] });
        }

        // ===== /ping =====
        else if (interaction.commandName === "ping") {
            console.log(chalk.bold.yellow("Interaksi perintah /ping diterima!"));
            const start = Date.now();
            const msg = await interaction.reply({ content: "⏳ Menghitung ping...", fetchReply: true });
            const latency = Date.now() - start;

            const embed = new EmbedBuilder()
                .setColor("#00FF9C")
                .setTitle("🏓 Pong!")
                .setDescription(`📡 **Latency bot:** \`${latency}ms\`\n💻 **API latency:** \`${Math.round(interaction.client.ws.ping)}ms\``)
                .setFooter({
                    text: "Dibuat dengan ❤️ oleh rahaaa_",
                    iconURL: "https://cdn.discordapp.com/emojis/1040325165512396830.webp?size=64&quality=lossless",
                });

            await interaction.editReply({ content: "", embeds: [embed] });
        }

        // ===== /roblox =====
        else if (interaction.commandName === "roblox") {
            const username = interaction.options.getString("username");
            await interaction.deferReply();

            const resUser = await fetch("https://users.roblox.com/v1/usernames/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usernames: [username] }),
            });
            const userData = await resUser.json();
            const user = userData.data[0];
            if (!user) return await interaction.editReply(`❌ Username **${username}** tidak ditemukan.`);

            const [detail, friends, games] = await Promise.all([
                fetch(`https://users.roblox.com/v1/users/${user.id}`).then(r => r.json()),
                fetch(`https://friends.roblox.com/v1/users/${user.id}/friends/count`).then(r => r.json()),
                fetch(`https://games.roblox.com/v2/users/${user.id}/games?limit=3&sortOrder=Asc`).then(r => r.json()),
            ]);

            const avatarURL = `https://www.roblox.com/headshot-thumbnail/image?userId=${user.id}&width=420&height=420&format=png`;
            const createdAt = new Date(detail.created).toLocaleString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
            const topGame = games.data?.[0];

            const embed = new EmbedBuilder()
                .setColor("#00A2FF")
                .setTitle(`👤 Profil Roblox: ${user.displayName}`)
                .setURL(`https://www.roblox.com/users/${user.id}/profile`)
                .setThumbnail(avatarURL)
                .addFields(
                    { name: "🧩 Username", value: user.name, inline: true },
                    { name: "🪪 User ID", value: `${user.id}`, inline: true },
                    { name: "👥 Jumlah Teman", value: `${friends.count ?? 0}`, inline: true },
                    { name: "🕐 Akun Dibuat", value: createdAt, inline: false },
                    { name: "📜 Bio", value: detail.description || "_(kosong)_", inline: false },
                );

            if (topGame) {
                embed.addFields({
                    name: "🎮 Game Buatan",
                    value: `[${topGame.name}](https://www.roblox.com/games/${topGame.id}) — ${topGame.playing ?? 0} pemain aktif`,
                    inline: false,
                });
            }

            embed.setFooter({
                text: "Data diambil dari API resmi Roblox",
                iconURL: "https://tr.rbxcdn.com/32b76c92f2f9f61e48ab67e528ce3f85/420/420/Image/Png",
            });

            await interaction.editReply({ content: "", embeds: [embed] });
            console.log(chalk.bold.green(`✅ Profil Roblox ${username} berhasil dikirim.`));
        }

        // ===== /copy =====
        else if (interaction.commandName === "copy") {
            const filePath = path.resolve(process.cwd(), "kodeRahasia.txt");
            if (!fs.existsSync(filePath)) {
                await interaction.reply({ content: "File kodeRahasia.txt tidak ditemukan di folder project.", ephemeral: true });
                return;
            }

            const kode = fs.readFileSync(filePath, "utf-8");
            if (kode.length <= 1900) {
                await interaction.reply({ content: `\`\`\`js\n${kode}\n\`\`\``, ephemeral: true });
            } else {
                const attachment = new AttachmentBuilder(Buffer.from(kode, "utf-8"), { name: "kodeRahasia.txt" });
                await interaction.reply({ content: "Ini code dan jan lupa follow @rahawaeh_113", files: [attachment], ephemeral: true });
            }
        }

        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.AI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [{ role: "user", content: "Halo!" }],
            }),
        });




    } catch (err) {
        console.error(err);
        try {
            await interaction.reply({ content: "⚠️ Terjadi kesalahan saat menjalankan perintah.", ephemeral: true });
        } catch { }
    }
}
