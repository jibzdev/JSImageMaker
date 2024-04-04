const express = require('express');
const app = express();
const Jimp = require('jimp');
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
};

app.get('/og', async (req, res) => {
    try {
        const { username, pfpUrl } = req.query;
        const backgroundImage = "bg.jpg";
        const defaultPfpPath = "default.png";
        const additionalText = "ammo.lol/" + username;

        const customFont = await Jimp.loadFont('Mont.fnt');

        const image = await Jimp.read(backgroundImage);

        const font = customFont;
        const subFont = await Jimp.loadFont('Mont.fnt');

        const textWidth = Jimp.measureText(font, username);
        const x = (1200 - textWidth) / 2;
        const y = (680 - 64) / 2;

        const subTextWidth = Jimp.measureText(subFont, additionalText);
        const subX = (1200 - subTextWidth) / 2;
        const subY = (590 - 32) / 2;

        const pfpPath = isValidUrl(pfpUrl) ? pfpUrl : defaultPfpPath;
        const pfp = await Jimp.read(pfpPath);
        pfp.resize(150, 150);

        image.print(font, x, y, username);
        image.print(subFont, subX, subY + 100, additionalText);
        image.composite(pfp.circle({ radius: 70, antialias: true }), 525, 135);

        const imgBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);

        res.set('Content-Type', 'image/jpeg');
        res.send(imgBuffer);
    } catch (error) {
        console.error('Invalid URL entered');
        res.status(500).send('Error 404');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
