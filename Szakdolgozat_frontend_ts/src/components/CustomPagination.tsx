import { HStack, IconButton, Text } from '@chakra-ui/react'
import { BiLeftArrow, BiRightArrow } from 'react-icons/bi'

interface CustomPaginationProps {
    itemOffset: number,
    itemsPerPage: number,
    items: Array<any>,
    setItemOffset: React.Dispatch<React.SetStateAction<number>>
}

export default function CustomPagination({ itemOffset, itemsPerPage, items: logging, setItemOffset }: CustomPaginationProps) {
    const handlePageClick = (back: boolean) => {
        if (back) {
            if (itemOffset === 0)
                return
            const newOffset = itemOffset - itemsPerPage
            setItemOffset(newOffset);
        }
        else {
            if (((itemOffset / itemsPerPage) + 1) === Math.ceil(logging!.length / itemsPerPage))
                return
            const newOffset = itemOffset + itemsPerPage
            setItemOffset(newOffset);
        }
    };
    return (
        <HStack justify="center">
            <IconButton colorScheme="blue" onClick={() => handlePageClick(true)} aria-label="left arrow" icon={<BiLeftArrow />} />
            <Text userSelect={"none"}>{(itemOffset / itemsPerPage) + 1}/{Math.ceil(logging.length / itemsPerPage)} oldal</Text>
            <IconButton colorScheme="blue" onClick={() => handlePageClick(false)} aria-label="right arrow" icon={<BiRightArrow />} />
        </HStack>
    )
}
