import { useEditableControls, ButtonGroup, Button, Flex, Text } from "@chakra-ui/react"
export default function EditableControls({ handleEditComment }) {
    const {
        isEditing,
        getSubmitButtonProps,
        getCancelButtonProps,
        getEditButtonProps,
    } = useEditableControls()

    return isEditing ? (
        <ButtonGroup textAlign={"left"} size='sm'>
            <Button colorScheme="blue"  {...getSubmitButtonProps()} onClick={() => handleEditComment()}>Elment</Button>
            <Button {...getCancelButtonProps()}>Mégsem</Button>
        </ButtonGroup>
    ) : (
        <Flex justifyContent='left'>
            <Text mr={5} _hover={{ textDecor: "underline", cursor: "pointer" }} fontSize={"sm"} {...getEditButtonProps()} >Módosít</Text>
            <Text _hover={{ textDecor: "underline", cursor: "pointer" }} fontSize={"sm"} >Törlés</Text>
        </Flex>
    )
}