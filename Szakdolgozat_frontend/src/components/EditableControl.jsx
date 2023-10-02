import { useEditableControls, ButtonGroup, Button, Flex, Text } from "@chakra-ui/react"
export default function EditableControls() {
    const {
        isEditing,
        getSubmitButtonProps,
        getCancelButtonProps,
        getEditButtonProps,
    } = useEditableControls()

    return isEditing ? (
        <ButtonGroup textAlign={"left"} size='sm'>
            <Button colorScheme="blue" {...getSubmitButtonProps()}>Elment</Button>
            <Button {...getCancelButtonProps()}>Mégsem</Button>
        </ButtonGroup>
    ) : (
        <Flex justifyContent='left'>
            <Text _hover={{ textDecor: "underline", cursor: "pointer" }} fontSize={"sm"} {...getEditButtonProps()} >Módosít</Text>
        </Flex>
    )
}