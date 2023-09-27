import { VStack, Text, HStack, Spacer, AvatarGroup, useColorMode, Avatar } from "@chakra-ui/react"
import { Draggable } from "react-beautiful-dnd"
import { AiFillCheckSquare } from "react-icons/ai"

export default function Issue({ issue, handleOpenIssue, handlePriorityIcon, index, boardId }) {

    const { colorMode } = useColorMode()

    return (
        <Draggable key={issue.id} index={index} draggableId={`${issue.id}`}>
            {provided => (
                <VStack _hover={{ bg: (colorMode === 'light' ? "gray.100" : "gray.500"), cursor: 'pointer' }} onClick={() => handleOpenIssue(issue, boardId)} ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps} bg={colorMode === 'light' ? "white" : '#333'} align="center" borderRadius={5} p={1} justify={"center"}>
                    <Text noOfLines={1}>{issue.title}</Text>
                    <HStack w={"full"}>
                        <AiFillCheckSquare color='#42a4ff' />
                        {handlePriorityIcon(issue.priority)}
                        <Spacer />
                        <AvatarGroup size="xs" max={2}>
                            {issue.assignedPeople.map((j, k) => {
                                return <Avatar key={k} name={j.personName} />
                            })}
                        </AvatarGroup>
                    </HStack>
                </VStack>
            )
            }
        </Draggable>
    )
}
