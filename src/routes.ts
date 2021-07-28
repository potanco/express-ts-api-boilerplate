import { Request, Response, Router } from 'express';
import swaggerUi from 'swagger-ui-express';


const router = Router();

// Test Route
 router.get('/', (req, res, next) => {
   res.send('Hi There!');
 });

//Swagger Route
 router.get(
   '/docs',
   swaggerUi.serve,
   async (_req: Request, res: Response) => {
     return res.send(swaggerUi.generateHTML(await import('../swagger.json')));
   }
 );


export default router;
