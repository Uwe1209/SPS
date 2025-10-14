import flet as ft

def main(page: ft.Page):
    """Main function for the Flet GUI."""
    page.title = "Image Classification Finetuner"

    def on_dialog_result(e: ft.FilePickerResultEvent):
        if e.path:
            data_dir_path.value = e.path
            page.update()

    def on_save_dialog_result(e: ft.FilePickerResultEvent):
        if e.path:
            save_model_path.value = e.path
            page.update()

    def on_load_dialog_result(e: ft.FilePickerResultEvent):
        if e.files:
            load_model_path.value = e.files[0].path
            page.update()

    file_picker = ft.FilePicker(on_result=on_dialog_result)
    save_file_picker = ft.FilePicker(on_result=on_save_dialog_result)
    load_file_picker = ft.FilePicker(on_result=on_load_dialog_result)
    page.overlay.extend([file_picker, save_file_picker, load_file_picker])

    data_dir_path = ft.TextField(label="Dataset Directory", read_only=True, expand=True)
    save_model_path = ft.TextField(label="Save Model Path", read_only=True, expand=True)
    load_model_path = ft.TextField(label="Load Model Path", read_only=True, expand=True)

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
        ft.Row(
            [
                ft.ElevatedButton(
                    "Save Model As...",
                    on_click=lambda _: save_file_picker.save_file(
                        dialog_title="Save Model As..."
                    ),
                ),
                save_model_path,
            ]
        ),
        ft.Row(
            [
                ft.ElevatedButton(
                    "Load Model From...",
                    on_click=lambda _: load_file_picker.pick_files(
                        dialog_title="Load Model From...", allow_multiple=False
                    ),
                ),
                load_model_path,
            ]
        ),
        ft.TextField(label="Number of Epochs"),
        ft.TextField(label="Batch Size"),
        ft.TextField(label="Learning Rate"),
    )
    page.update()

if __name__ == "__main__":
    ft.app(target=main)
