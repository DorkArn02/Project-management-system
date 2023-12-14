import { api } from "."
import { AuditLogResponse } from "../interfaces/interfaces"

export const getAuditLogs = async (projectId: string) => {
    const logs =
        await api.get<Array<AuditLogResponse>>(`/AuditLog/Get/${projectId}`)
    return logs

}