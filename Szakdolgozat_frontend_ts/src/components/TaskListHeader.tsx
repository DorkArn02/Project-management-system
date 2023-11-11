import { Table, TableContainer, Text, Th, Thead, Tr } from '@chakra-ui/react';
import React from 'react'

const TaskListHeader: React.FC<{ headerHeight: number; rowWidth: string; fontFamily: string; fontSize: string; }> = ({
    fontFamily,
    fontSize,
    headerHeight,
    rowWidth
}) => {
    return (
        <TableContainer>
            <Table>
                <Thead>
                    <Tr h={headerHeight} >
                        <Th fontFamily={fontFamily} fontSize={fontSize} textAlign={"center"}><Text w={rowWidth}>Név</Text></Th>
                        <Th fontFamily={fontFamily} fontSize={fontSize} textAlign={"center"}><Text w={rowWidth}>Kezdet</Text></Th>
                        <Th fontFamily={fontFamily} fontSize={fontSize} textAlign={"center"}><Text w={rowWidth}>Vég</Text></Th>
                    </Tr>
                </Thead>
            </Table>
        </TableContainer>
    );
}

export default TaskListHeader