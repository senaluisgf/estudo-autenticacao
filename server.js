require('dotenv').config()
const app = require('./app');
const port = 3000;
const db = require('./database');
require('./redis/blocklist-access-token')
require('./redis/allowlist-refresh-token')

const routes = require('./rotas');
const middlewareDeErros = require('./src/middlewares/middlewareDeErros');
routes(app);

app.use(middlewareDeErros)

app.listen(port, () => console.log(`App listening on port ${port}`));
