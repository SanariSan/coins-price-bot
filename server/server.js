import { log } from '../util';

function setupServerActions(app, webhookCallback) {
  const { PORT } = process.env;

  app.get('/', (req, res) => res.send('Hello World!'));
  app.use(webhookCallback);
  app.listen(PORT, () => log(`App listening on port ${PORT}`));
}

export { setupServerActions };
