import flet as ft

def main(page: ft.Page):
    """Main function for the Flet GUI."""
    page.title = "Image Classification Finetuner"

    def on_dialog_result(e: ft.FilePickerResultEvent):
        if e.path:
            data_dir_path.value = e.path
            page.update()

    file_picker = ft.FilePicker(on_result=on_dialog_result)
    page.overlay.append(file_picker)

    data_dir_path = ft.TextField(label="Dataset Directory", read_only=True, expand=True)

    page.add(
        ft.Dropdown(
            label="Select Model",
            options=[
                ft.dropdown.Option("resnet18"),
                ft.dropdown.Option("vgg16"),
                ft.dropdown.Option("alexnet"),
                ft.dropdown.Option("googlenet"),
            ],
        ),
        ft.Row(
            [
                ft.ElevatedButton(
                    "Select Dataset Directory",
                    on_click=lambda _: file_picker.get_directory_path(
                        dialog_title="Select Dataset Directory"
                    ),
                ),
                data_dir_path,
            ]
        ),
    )
    page.update()

if __name__ == "__main__":
    ft.app(target=main)
