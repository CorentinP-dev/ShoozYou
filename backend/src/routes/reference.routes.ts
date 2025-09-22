import { Router } from 'express';
import { listGendersHandler, listShoeTypesHandler } from '../controllers/reference.controller';

export const referenceRouter = Router();

referenceRouter.get('/genders', listGendersHandler);
referenceRouter.get('/shoe-types', listShoeTypesHandler);
