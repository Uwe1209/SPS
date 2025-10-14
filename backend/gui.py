import flet as ft
import threading
from finetune import main as finetune_main

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

    def start_finetuning(e):
        """Callback to start the fine-tuning process in a separate thread."""
        start_button.disabled = True
        progress_ring.visible = True
        status_text.value = "Fine-tuning in progress..."
        result_text.value = ""
        page.update()

        settings = {
            'data_dir': data_dir_path.value,
            'model_name': model_dropdown.value or 'resnet18',
            'num_epochs': int(epochs_field.value) if epochs_field.value else 25,
            'batch_size': int(batch_size_field.value) if batch_size_field.value else 32,
            'learning_rate': float(learning_rate_field.value) if learning_rate_field.value else 0.001,
            'load_path': load_model_path.value or None,
            'save_path': save_model_path.value or None,
        }

        def run_finetuning(settings_dict):
            """Target function for the training thread."""
            try:
                final_accuracy = finetune_main(settings_dict)
                result_text.value = f"Fine-tuning finished. Final validation accuracy: {final_accuracy:.4f}"
            except Exception as ex:
                result_text.value = f"An error occurred: {ex}"
            
            start_button.disabled = False
            progress_ring.visible = False
            status_text.value = ""
            page.update()

        thread = threading.Thread(target=run_finetuning, args=(settings,))
        thread.start()

    file_picker = ft.FilePicker(on_result=on_dialog_result)
    save_file_picker = ft.FilePicker(on_result=on_save_dialog_result)
    load_file_picker = ft.FilePicker(on_result=on_load_dialog_result)
    page.overlay.extend([file_picker, save_file_picker, load_file_picker])

    data_dir_path = ft.TextField(label="Dataset Directory", read_only=True, expand=True)
    save_model_path = ft.TextField(label="Save Model Path", read_only=True, expand=True)
    load_model_path = ft.TextField(label="Load Model Path", read_only=True, expand=True)

    model_dropdown = ft.Dropdown(
        label="Select Model",
        options=[
            ft.dropdown.Option("resnet18"),
            ft.dropdown.Option("vgg16"),
            ft.dropdown.Option("alexnet"),
            ft.dropdown.Option("googlenet"),
        ],
    )
    epochs_field = ft.TextField(label="Number of Epochs", value="25")
    batch_size_field = ft.TextField(label="Batch Size", value="32")
    learning_rate_field = ft.TextField(label="Learning Rate", value="0.001")
    start_button = ft.ElevatedButton(text="Start Fine-Tuning", on_click=start_finetuning)
    status_text = ft.Text()
    progress_ring = ft.ProgressRing(visible=False)
    result_text = ft.Text()

    page.add(
        model_dropdown,
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
        epochs_field,
        batch_size_field,
        learning_rate_field,
        start_button,
        status_text,
        progress_ring,
        result_text,
    )
    page.update()

if __name__ == "__main__":
    ft.app(target=main)
