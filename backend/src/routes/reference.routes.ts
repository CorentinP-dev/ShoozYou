import { Router } from 'express';
import { listBrandsHandler, listGendersHandler, listShoeTypesHandler } from '../controllers/reference.controller';

export const referenceRouter = Router();

referenceRouter.get('/genders', listGendersHandler);
referenceRouter.get('/shoe-types', listShoeTypesHandler);
referenceRouter.get('/brands', listBrandsHandler);
