import { Repository } from 'typeorm';
import { ManagerInvitation } from 'src/entities/manager-invitation.entity';
import { ManagerSubordinate } from 'src/entities/manager-subordinate.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { GetInvitationReceivedDto, GetInvitationSendDto } from './dto/get-invitation.dto';
import { CreateManagerSubordinateDto } from './dto/create-manager.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UsersService } from '../users/users.service';
import { InvitationResponseDto } from './dto/response-invitation.dto';
export declare class ManagerService {
    private managerInvitationRepository;
    private managerSubordinateRepository;
    private usersService;
    private readonly logger;
    constructor(managerInvitationRepository: Repository<ManagerInvitation>, managerSubordinateRepository: Repository<ManagerSubordinate>, usersService: UsersService);
    private validateUsers;
    getInvitation(id: number): Promise<InvitationResponseDto>;
    createInvitation(createInvitationDto: CreateInvitationDto): Promise<InvitationResponseDto>;
    acceptInvitation(id: number, subordinateUuid: string): Promise<InvitationResponseDto>;
    rejectInvitation(id: number, subordinateUuid: string): Promise<InvitationResponseDto>;
    cancelInvitation(id: number, managerUuid: string): Promise<InvitationResponseDto>;
    removeManagerSubordinate(managerUuid: string, subordinateUuid: string): Promise<void>;
    private createManagerSubordinate;
    getInvitationSend(getInvitationSendDto: GetInvitationSendDto): Promise<InvitationResponseDto[]>;
    getInvitationReceived(getInvitationReceivedDto: GetInvitationReceivedDto): Promise<InvitationResponseDto[]>;
    getInvitationUsers(createManagerSubordinateDto: CreateManagerSubordinateDto): Promise<InvitationResponseDto>;
    getManagerList(subordinateUuid: string): Promise<UserResponseDto[]>;
    getSubordinateList(managerUuid: string): Promise<UserResponseDto[]>;
    validateAndCheckManagerRelation(managerUuid: string, subordinateUuid: string): Promise<boolean>;
}