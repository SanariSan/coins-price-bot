function setupServerActions(app, webhookCallback) {
  const { PORT } = process.env;

  app.get('/', (req, res) => res.send('Hello World!'));
  app.use(webhookCallback);
  app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
}

export { setupServerActions };
