import { errorJson } from './_shared.js';
import { onRequestGet as listResales } from './resales.js';
import { onRequestPost as createResale } from './resales/create.js';

export async function onRequestGet(context) {
  try {
    return await listResales(context);
  } catch (error) {
    return errorJson(error);
  }
}

export async function onRequestPost(context) {
  try {
    return await createResale(context);
  } catch (error) {
    return errorJson(error);
  }
}
