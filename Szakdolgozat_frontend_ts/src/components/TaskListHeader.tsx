import { Table, TableContainer, Text, Th, Thead, Tr } from '@chakra-ui/react';
import React from 'react'
import { useTranslation } from 'react-i18next';

const TaskListHeader: React.FC<{ headerHeight: number; rowWidth: string; fontFamily: string; fontSize: string; }> = ({
    fontFamily,
    fontSize,
    headerHeight,
    rowWidth
}) => {

    const { t, ready } = useTranslation()

    if (ready)
        return (
            <TableContainer>
                <Table>
                    <Thead>
                        <Tr h={headerHeight} >
                            <Th fontFamily={fontFamily} fontSize={fontSize} textAlign={"center"}><Text w={rowWidth}>{t('gantt.label_title')}</Text></Th>
                            <Th fontFamily={fontFamily} fontSize={fontSize} textAlign={"center"}><Text w={rowWidth}>{t('gantt.label_start')}</Text></Th>
                            <Th fontFamily={fontFamily} fontSize={fontSize} textAlign={"center"}><Text w={rowWidth}>{t('gantt.label_end')}</Text></Th>
                        </Tr>
                    </Thead>
                </Table>
            </TableContainer>
        );
}

export default TaskListHeader