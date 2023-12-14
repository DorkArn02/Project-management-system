import { Stack, Text, HStack, Spacer, AvatarGroup, useColorMode, Avatar, Tooltip } from "@chakra-ui/react"
import moment from "moment"
import { ReactNode } from "react"
import { Draggable } from "react-beautiful-dnd"
import { BiTime } from "react-icons/bi"
import { IssueResponse, PriorityResponse } from "../interfaces/interfaces"

interface IssueProps {
    issue: IssueResponse,
    handleOpenIssue: (issue: IssueResponse, boardId: string) => void,
    handlePriorityIcon: (priority: PriorityResponse) => ReactNode,
    handleIssueTypeIcon: (name: string) => ReactNode,
    index: number,
    boardId: string
}

export default function Issue({ issue, handleOpenIssue, handlePriorityIcon, handleIssueTypeIcon, index, boardId }: IssueProps) {

    const { colorMode } = useColorMode()


    return (
        <Draggable key={issue.id} index={index} draggableId={`${issue.id}`}>
            {provided => (
                <Stack _hover={{ bg: (colorMode === 'light' ? "gray.100" : "gray.500"), cursor: 'pointer' }} onClick={() => handleOpenIssue(issue, boardId)} ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps} bg={colorMode === 'light' ? "white" : '#333'} align="center" borderRadius={5} p={1} justify={"center"}>
                    <Tooltip label={issue.title}><Text noOfLines={1}>{issue.title}</Text></Tooltip>
                    <HStack w={"full"}>
                        <Tooltip shouldWrapChildren={true} label={issue.issueType.name}>{handleIssueTypeIcon(issue.issueType.name)}</Tooltip>
                        <Tooltip shouldWrapChildren={true} label={issue.priority.name}>{handlePriorityIcon(issue.priority)}</Tooltip>
                        <Tooltip shouldWrapChildren={true} label={moment(issue.dueDate).format("yyyy-MM-DD")}><BiTime color={moment(issue.dueDate).isBefore(Date.now()) ? "red" : "lightgreen"} /></Tooltip>
                        <Spacer />
                        <AvatarGroup size="xs" max={2}>
                            {issue.assignedPeople.map((j, k) => {
                                return <Avatar key={k} name={j.personName} />
                            })}
                        </AvatarGroup>
                    </HStack>
                </Stack>
            )
            }
        </Draggable>
    )
}
