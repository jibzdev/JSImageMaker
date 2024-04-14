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
        const defaultPfpPath = "default.png";
        const additionalText = "ammo.lol/" + username;
        const usernameFont = await Jimp.loadFont('Kanit_Light.fnt');
        const additionalTextFont = await Jimp.loadFont('Kanit_Light_Grey.fnt');

        const image = new Jimp(1200, 630, (err, image) => {
            if (err) throw err;
            for (let y = 0; y < image.bitmap.height; y++) {
                for (let x = 0; x < image.bitmap.width; x++) {

                    const red = 30 + Math.floor(5 * (y / image.bitmap.height));
                    const green = 64 + Math.floor(155 * (y / image.bitmap.height));
                    const blue = 175 + Math.floor(20 * (y / image.bitmap.height));
                    const alpha = 1;
                    const color = Jimp.rgbaToInt(red, green, blue, alpha);
                    image.setPixelColor(color, x, y);
                }
            }
        });

        const textWidth = Jimp.measureText(usernameFont, username);
        const x = (1200 - textWidth) / 2;
        const y = (800 - 64) / 2;

        const subTextWidth = Jimp.measureText(additionalTextFont, additionalText);
        const subX = (1200 - subTextWidth) / 2;
        const subY = (800 - 32) / 2;
        const pfpPath = isValidUrl(pfpUrl) ? pfpUrl : defaultPfpPath;
        const pfp = await Jimp.read(pfpPath);
        pfp.resize(300, 300);

        const mask = new Jimp(300, 300, 0x00000000);
        const radius = 150;
        mask.scan(0, 0, mask.bitmap.width, mask.bitmap.height, function(x, y, idx) {
            const dx = x - radius;
            const dy = y - radius;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= radius) {
                this.bitmap.data[idx + 0] = 255;
                this.bitmap.data[idx + 1] = 255;
                this.bitmap.data[idx + 2] = 255;
                this.bitmap.data[idx + 3] = 255;
            }
        });

        pfp.mask(mask, 0, 0);

        image.print(usernameFont, x, y, username);
        image.print(additionalTextFont, subX, subY + 100, additionalText);
        const pfpX = (1200 - 300) / 2;
        const pfpY = (450 - 300) / 2;
        image.composite(pfp, pfpX, pfpY);

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