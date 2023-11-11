import { Table, TableContainer, Tbody, Td, Text, Tr } from "@chakra-ui/react";
import { Task } from "gantt-task-react";
import moment from "moment";
import React from "react";

const TaskListTable: React.FC<{ rowHeight: number; rowWidth: string; fontFamily: string; fontSize: string; locale: string; tasks: Array<Task>; selectedTaskId: string; setSelectedTask: (taskId: string) => void; }> = ({
    fontFamily,
    fontSize,
    rowHeight,
    rowWidth,
    tasks
}) => {
    return (
        <TableContainer>
            <Table variant="striped">
                <Tbody>
                    {tasks.map((t, k) => {
                        return <Tr height={rowHeight} key={k}>
                            <Td fontSize={fontSize} fontFamily={fontFamily} overflow={"hidden"}><Text isTruncated w={rowWidth}>{t.name}</Text></Td>
                            <Td fontSize={fontSize} fontFamily={fontFamily} textAlign={"center"}><Text w={rowWidth}>{moment(t.start).format("yyyy-MM-DD")}</Text></Td>
                            <Td fontSize={fontSize} fontFamily={fontFamily} textAlign={"center"}><Text >{moment(t.end).format("yyyy-MM-DD")}</Text></Td>
                        </Tr>
                    })}
                </Tbody>
            </Table>
        </TableContainer>
    )
}

export default TaskListTable