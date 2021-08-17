import App from './app';
import { AdminRoute } from './modules/admin/admin.route';

import { AuthRoute } from './modules/auth/auth.route';

/**
 * App Variables
 */
const app = new App([new AuthRoute(), new AdminRoute()]);

app.listen();
