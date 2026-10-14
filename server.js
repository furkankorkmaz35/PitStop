import app from './app.js';

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`PitStop: http://localhost:${port}`);
});

if (port === 3000) {
  try {
    app.listen(3001, () => {
      console.log('PitStop (Temiz Port): http://localhost:3001');
    });
  } catch (e) {
    // Port 3001 might be optional
  }
}
