// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAdmin from '../../../app/controller/admin';
import ExportIndex from '../../../app/controller/index';
import ExportLogin from '../../../app/controller/login';

declare module 'egg' {
  interface IController {
    admin: ExportAdmin;
    index: ExportIndex;
    login: ExportLogin;
  }
}
