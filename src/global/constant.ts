import { EnvDto } from './configs/env.dto';
import { loadEnvConfig } from 'libs/basic-utils/configs/env-config';
import packageJson from 'package.json';

export const ENV = loadEnvConfig(EnvDto);
export const APP_NAME: string = packageJson.name;
export const APP_VERSION: string = packageJson.version;
export const APP_DESCRIPTION: string = packageJson.description;
