# Audio assets

Place your two tracks in this folder with these exact names (or update the variables at the top of `script.js`):

- `song1.mp3` — default track for “Tap to play our song”
- `song2.mp3` — alternate track for “Tap here to change the song”

In `script.js`:

```js
const SONG1_FILE = "song1.mp3";
const SONG2_FILE = "song2.mp3";
```

Until these files exist, play buttons will not produce sound (the UI still works; browsers may log a media error).
