"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const users_controller_1 = require("./users.controller");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../../entities/user.entity");
const auth_entity_1 = require("../../entities/auth.entity");
const auth_module_1 = require("../../auth/auth.module");
const user_routine_entity_1 = require("../../entities/user-routine.entity");
const users_routine_controller_1 = require("./users-routine.controller");
const users_routine_service_1 = require("./users-routine.service");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([auth_entity_1.Auth, user_entity_1.User, auth_module_1.AuthModule, user_routine_entity_1.UserRoutine]),
            auth_module_1.AuthModule,
        ],
        controllers: [users_controller_1.UsersController, users_routine_controller_1.UsersRoutineController],
        providers: [users_service_1.UsersService, users_routine_service_1.UsersRoutineService],
        exports: [users_service_1.UsersService, users_routine_service_1.UsersRoutineService],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map