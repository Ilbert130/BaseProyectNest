import { applyDecorators } from "@nestjs/common";
import { ValidRoles } from "../interfaces/valid-roles";
import { RoleProtected } from "./role-protected.decorator";



export function Auth(...roles:ValidRoles[]) {
    return applyDecorators(
        RoleProtected(...roles),
        
    );
}