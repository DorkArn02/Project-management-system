import { ReactNode } from "react";

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    email: string;
}

export interface RegisterResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    registered: Date;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    registered: Date;
    accessToken: string;
}

export interface ProjectRequest {
    title: string;
    description: string;
}

export interface ProjectResponse {
    id: string;
    title: string;
    description: string;
    iconName: string;
    created: Date;
    updated: Date;
    participants: Array<ParticipantResponse>;
}

export interface ParticipantRequest {
    email: string
}

export interface ParticipantResponse {
    id: number;
    userId: string;
    roleName: string;
    firstName: string;
    lastName: string;
}

export interface ProjectListRequest {
    title: string;
    position: number;
}

export interface ProjectListResponse {
    id: string;
    title: string;
    position: number;
    projectId: string;
    issues: Array<IssueResponse>;
}

export interface IssueRequest {
    title: string;
    description?: string;
    dueDate: Date;
    position: number;
    timeEstimate?: number;
    priorityId: number;
    assignedPeople: Array<{ id: string, label: string, participantId: string, value: string }>
}

export interface IssueRequestView {
    title: string;
    description?: string;
    dueDate: Date;
    position: number;
    timeEstimate?: number;
    timeSpent: number;
    priorityId: { value: string, label: string, icon?: ReactNode };
    projectListId: string;
    issueTypeId: { value: string, label: string, icon?: ReactNode }
    assignedPeople: Array<{ id: number, label: string, value: string }>
}

export interface IssueRequestView2 {
    title: string;
    description?: string;
    dueDate: Date;
    timeEstimate?: number;
    timeSpent: number;
    priorityId: { value: string, label: string };
    projectListId: string;
    assignedPeople: Array<{ id: number, label: string, value: string }>
}

export interface IssueType {
    id: number,
    name: string
}

export interface IssueResponse {
    id: string;
    title: string;
    description: string;
    created: Date;
    updated: Date;
    dueDate: Date;
    position: number;
    timeEstimate: number;
    timeSpent: number;
    reporterId: string;
    reporterName: string;
    priority: PriorityResponse;
    assignedPeople: Array<AssignedPersonResponse>;
    comments: Array<CommentResponse>;
    parentIssueId?: string;
    childrenIssues?: Array<IssueResponse>
    issueType: IssueType;
    projectListId?: string;
}

export interface AssignedPersonResponse {
    id: number;
    issueId: string;
    userId: string;
    personName: string;
}

export interface CommentResponse {
    id: string;
    content: string;
    created: Date;
    updated: Date;
    userId: string;
    issueId: string;
    authorName: string;
}

export interface PriorityResponse {
    id: number;
    name: string;
    lvl: number;
}

export interface NotificationResponse {
    id: string;
    content: string;
    created: Date;
    userId: string;
    issueId: string;
    projectId: string;
    projectName: string;
    projectListName: string;
    issueName: string;
    personName: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    created: Date;
    updated: Date;
    dueDate: Date;
    position: number;
    timeEstimate: number;
    timeSpent: number;
    reporterId: string;
    reporterName: string;
    priority: PriorityResponse;
    boardName: string;
    projectName: string;
    issueType: IssueType;
    boardId: string
}

export interface PasswordChangeRequest {
    oldPassword: string;
    password1: string;
    password2: string;
}

export interface AuditLogResponse {
    id: string,
    userId: string,
    created: Date,
    content: string,
    projectId: string,
    personName: string,
    projectName: string
}