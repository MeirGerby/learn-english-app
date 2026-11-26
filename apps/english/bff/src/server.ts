import { serveBff } from '@learn-english/bff';
import app, { container } from './main.js';

serveBff(app, 'english-bff', () => container.dispose());
