import flet as ft
import threading
from finetune import main as finetune_main
from process_dataset import process_dataset

def main(page: ft.Page):
    """Main function for the Flet GUI."""
    page.title = "SmartPlant AI Finetuner"
    page.theme_mode = ft.ThemeMode.LIGHT
    page.window_min_width = 600
    page.window_min_height = 800
    page.padding = 0
    page.vertical_alignment = ft.MainAxisAlignment.START
    page.horizontal_alignment = ft.CrossAxisAlignment.CENTER

    TEXT_FIELD_HEIGHT =40
    BUTTON_HEIGHT =40
    BUTTON_WIDTH = 180

    # Define button styles for consistent appearance
    action_button_style = ft.ButtonStyle(
        shape=ft.RoundedRectangleBorder(radius=8),
        padding=ft.padding.symmetric(vertical=16, horizontal=24)
    )

    beside_button_style = ft.ButtonStyle(
        shape=ft.RoundedRectangleBorder(radius=8),
        padding=ft.padding.symmetric(vertical=15)
    )

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

    def on_source_dir_result(e: ft.FilePickerResultEvent):
        if e.path:
            source_dir_path.value = e.path
            page.update()

    def on_dest_dir_result(e: ft.FilePickerResultEvent):
        if e.path:
            dest_dir_path.value = e.path
            page.update()

    def start_processing(e):
        """Callback to start the dataset processing in a separate thread."""
        process_start_button.disabled = True
        process_status_text.visible = True
        process_status_text.value = "Processing dataset..."
        page.update()

        source_dir = source_dir_path.value
        dest_dir = dest_dir_path.value
        try:
            split_ratio = float(split_ratio_field.value)
        except (ValueError, TypeError):
            process_status_text.value = "Invalid split ratio. Please enter a number between 0 and 1."
            process_start_button.disabled = False
            page.update()
            return

        def progress_callback(message):
            process_status_text.value = message
            page.update()

        def run_processing():
            """Target function for the processing thread."""
            try:
                process_dataset(
                    source_dir=source_dir,
                    dest_dir=dest_dir,
                    split_ratio=split_ratio,
                    progress_callback=progress_callback
                )
                progress_callback("Dataset processing finished successfully.")
            except Exception as ex:
                progress_callback(f"An error occurred: {ex}")
            
            process_start_button.disabled = False
            page.update()

        thread = threading.Thread(target=run_processing)
        thread.start()

    def start_finetuning(e):
        """Callback to start the fine-tuning process in a separate thread."""
        start_button.disabled = True
        progress_ring.visible = True
        status_text.value = "Fine-tuning in progress..."
        result_text.value = ""
        result_text.visible = False
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
            
            result_text.visible = True
            start_button.disabled = False
            progress_ring.visible = False
            status_text.value = ""
            page.update()

        thread = threading.Thread(target=run_finetuning, args=(settings,))
        thread.start()

    file_picker = ft.FilePicker(on_result=on_dialog_result)
    save_file_picker = ft.FilePicker(on_result=on_save_dialog_result)
    load_file_picker = ft.FilePicker(on_result=on_load_dialog_result)
    source_dir_picker = ft.FilePicker(on_result=on_source_dir_result)
    dest_dir_picker = ft.FilePicker(on_result=on_dest_dir_result)
    page.overlay.extend([file_picker, save_file_picker, load_file_picker, source_dir_picker, dest_dir_picker])

    data_dir_path = ft.TextField(label="Dataset Directory", read_only=True, border_width=0.5, height=TEXT_FIELD_HEIGHT, expand=True)
    save_model_path = ft.TextField(label="Save Model Path", read_only=True, border_width=0.5, height=TEXT_FIELD_HEIGHT, expand=True)
    load_model_path = ft.TextField(label="Load Model Path", read_only=True, border_width=0.5, height=TEXT_FIELD_HEIGHT, expand=True)

    source_dir_path = ft.TextField(label="Source Directory", read_only=True, border_width=0.5, height=TEXT_FIELD_HEIGHT, expand=True)
    dest_dir_path = ft.TextField(label="Destination Directory", read_only=True, border_width=0.5, height=TEXT_FIELD_HEIGHT, expand=True)
    split_ratio_field = ft.TextField(label="Train/Validation Split Ratio", value="0.8", height=TEXT_FIELD_HEIGHT)
    process_start_button = ft.ElevatedButton(
        text="Run Processing",
        on_click=start_processing,
        icon=ft.Icons.PLAY_ARROW,
        bgcolor=ft.Colors.GREEN_700,
        color=ft.Colors.WHITE,
        style=action_button_style,
        height=BUTTON_HEIGHT,
    )
    process_status_text = ft.TextField(
        read_only=True,
        multiline=True,
        height=100,
        border_width=0.5,
        border_color=ft.Colors.GREY_500,
        visible=False,
    )

    model_dropdown = ft.Dropdown(
        label="Select Model",
        options=[
            ft.dropdown.Option("resnet18"),
            ft.dropdown.Option("vgg16"),
            ft.dropdown.Option("alexnet"),
            ft.dropdown.Option("googlenet"),
        ],
        border_radius=8,
        border_color=ft.Colors.GREY_500,
        focused_border_color=ft.Colors.GREEN_700,
        expand=True,
    )
    epochs_field = ft.TextField(label="Number of Epochs", value="25", height=TEXT_FIELD_HEIGHT)
    batch_size_field = ft.TextField(label="Batch Size", value="32", height=TEXT_FIELD_HEIGHT)
    learning_rate_field = ft.TextField(label="Learning Rate", value="0.001", height=TEXT_FIELD_HEIGHT)
    start_button = ft.ElevatedButton(
        text="Run Fine-Tuning",
        on_click=start_finetuning,
        icon=ft.Icons.MODEL_TRAINING,
        bgcolor=ft.Colors.GREEN_700,
        color=ft.Colors.WHITE,
        style=action_button_style,
        height=BUTTON_HEIGHT,
    )
    status_text = ft.Text()
    progress_ring = ft.ProgressRing(visible=False)
    result_text = ft.TextField(
        read_only=True,
        multiline=True,
        height=100,
        border_width=0.5,
        border_color=ft.Colors.GREY_500,
        visible=False,
    )

    tabs = ft.Tabs(
        selected_index=0,
        animation_duration=300,
        tabs=[
            ft.Tab(
                text="Process Dataset",
                content=ft.Container(
                    content=ft.Container(
                        content=ft.Column(
                            [
                                ft.Container(
                                    content=ft.Card(
                                        content=ft.Container(
                                            content=ft.Column(
                                                [
                                                    ft.Text("Directories", theme_style=ft.TextThemeStyle.TITLE_MEDIUM),
                                                    ft.Row(
                                                        [
                                                            source_dir_path,
                                                            ft.ElevatedButton(
                                                                "Select Source",
                                                                icon=ft.Icons.FOLDER_OPEN,
                                                                on_click=lambda _: source_dir_picker.get_directory_path(
                                                                    dialog_title="Select Source Directory"
                                                                ),
                                                                bgcolor=ft.Colors.GREEN_700,
                                                                color=ft.Colors.WHITE,
                                                                style=beside_button_style,
                                                                width=BUTTON_WIDTH,
                                                                height=BUTTON_HEIGHT,
                                                            ),
                                                        ],
                                                        spacing=10,
                                                        vertical_alignment=ft.CrossAxisAlignment.CENTER,
                                                    ),
                                                    ft.Row(
                                                        [
                                                            dest_dir_path,
                                                            ft.ElevatedButton(
                                                                "Select Destination",
                                                                icon=ft.Icons.FOLDER_OPEN,
                                                                on_click=lambda _: dest_dir_picker.get_directory_path(
                                                                    dialog_title="Select Destination Directory"
                                                                ),
                                                                bgcolor=ft.Colors.GREEN_700,
                                                                color=ft.Colors.WHITE,
                                                                style=beside_button_style,
                                                                width=BUTTON_WIDTH,
                                                                height=BUTTON_HEIGHT,
                                                            ),
                                                        ],
                                                        spacing=10,
                                                        vertical_alignment=ft.CrossAxisAlignment.CENTER,
                                                    ),
                                                ],
                                                spacing=10,
                                                horizontal_alignment=ft.CrossAxisAlignment.STRETCH,
                                            ),
                                            padding=ft.padding.all(15)
                                        ),
                                        elevation=2, shape=ft.RoundedRectangleBorder(radius=8),
                                        width=800,
                                    ),
                                    alignment=ft.alignment.center,
                                    padding=ft.padding.only(top=20),
                                ),
                                ft.Container(
                                    content=ft.Card(
                                        content=ft.Container(
                                            content=ft.Column(
                                                [
                                                    ft.Text("Settings", theme_style=ft.TextThemeStyle.TITLE_MEDIUM),
                                                    split_ratio_field,
                                                ],
                                                spacing=10
                                            ),
                                            padding=ft.padding.all(15)
                                        ),
                                        elevation=2, shape=ft.RoundedRectangleBorder(radius=8),
                                        width=800,
                                    ),
                                    alignment=ft.alignment.center,
                                    padding=ft.padding.only(top=20),
                                ),
                                ft.Container(
                                    content=ft.Card(
                                        content=ft.Container(
                                            content=ft.Column(
                                                [
                                                    ft.Text("Actions", theme_style=ft.TextThemeStyle.TITLE_MEDIUM),
                                                    process_start_button,
                                                    process_status_text,
                                                ],
                                                spacing=10,
                                                horizontal_alignment=ft.CrossAxisAlignment.STRETCH,
                                            ),
                                            padding=ft.padding.all(15)
                                        ),
                                        elevation=2, shape=ft.RoundedRectangleBorder(radius=8),
                                        width=800,
                                    ),
                                    alignment=ft.alignment.center
                                ),
                            ],
                            spacing=20,
                            scroll=ft.ScrollMode.ADAPTIVE,
                            horizontal_alignment=ft.CrossAxisAlignment.STRETCH,
                        ),
                    ),
                    alignment=ft.alignment.top_center,
                ),
            ),
            ft.Tab(
                text="Fine-Tuning",
                content=ft.Container(
                    content=ft.Container(
                        content=ft.Column(
                            [
                                ft.Container(
                                    content=ft.Card(
                                        content=ft.Container(
                                            content=ft.Column(
                                                [
                                                    ft.Text("Configuration", theme_style=ft.TextThemeStyle.TITLE_MEDIUM),
                                                    ft.Text("Model & Data", theme_style=ft.TextThemeStyle.TITLE_SMALL),
                                                    model_dropdown,
                                                    ft.Row(
                                                        [
                                                            data_dir_path,
                                                            ft.ElevatedButton(
                                                                "Select Dataset",
                                                                icon=ft.Icons.FOLDER_OPEN,
                                                                on_click=lambda _: file_picker.get_directory_path(
                                                                    dialog_title="Select Dataset Directory"
                                                                ),
                                                                bgcolor=ft.Colors.GREEN_700,
                                                                color=ft.Colors.WHITE,
                                                                style=beside_button_style,
                                                                width=BUTTON_WIDTH,
                                                                height=BUTTON_HEIGHT,
                                                            ),
                                                        ],
                                                        spacing=10,
                                                        vertical_alignment=ft.CrossAxisAlignment.CENTER,
                                                    ),
                                                    ft.Row(
                                                        [
                                                            save_model_path,
                                                            ft.ElevatedButton(
                                                                "Set Save Path",
                                                                icon=ft.Icons.SAVE,
                                                                on_click=lambda _: save_file_picker.save_file(
                                                                    dialog_title="Save Model As..."
                                                                ),
                                                                bgcolor=ft.Colors.GREEN_700,
                                                                color=ft.Colors.WHITE,
                                                                style=beside_button_style,
                                                                width=BUTTON_WIDTH,
                                                                height=BUTTON_HEIGHT,
                                                            ),
                                                        ],
                                                        spacing=10,
                                                        vertical_alignment=ft.CrossAxisAlignment.CENTER,
                                                    ),
                                                    ft.Row(
                                                        [
                                                            load_model_path,
                                                            ft.ElevatedButton(
                                                                "Select Model File",
                                                                icon=ft.Icons.UPLOAD_FILE,
                                                                on_click=lambda _: load_file_picker.pick_files(
                                                                    dialog_title="Load Model From...", allow_multiple=False
                                                                ),
                                                                bgcolor=ft.Colors.GREEN_700,
                                                                color=ft.Colors.WHITE,
                                                                style=beside_button_style,
                                                                width=BUTTON_WIDTH,
                                                                height=BUTTON_HEIGHT,
                                                            ),
                                                        ],
                                                        spacing=10,
                                                        vertical_alignment=ft.CrossAxisAlignment.CENTER,
                                                    ),
                                                    ft.Divider(),
                                                    ft.Text("Hyperparameters", theme_style=ft.TextThemeStyle.TITLE_SMALL),
                                                    epochs_field,
                                                    batch_size_field,
                                                    learning_rate_field,
                                                ],
                                                spacing=10,
                                                horizontal_alignment=ft.CrossAxisAlignment.STRETCH,
                                            ),
                                            padding=ft.padding.all(15)
                                        ),
                                        elevation=2, shape=ft.RoundedRectangleBorder(radius=8),
                                        width=800,
                                    ),
                                    alignment=ft.alignment.center,
                                    padding=ft.padding.only(top=20),
                                ),
                                ft.Container(
                                    content=ft.Card(
                                        content=ft.Container(
                                            content=ft.Column(
                                                [
                                                    ft.Text("Training", theme_style=ft.TextThemeStyle.TITLE_MEDIUM),
                                                    start_button,
                                                    status_text,
                                                    progress_ring,
                                                    result_text,
                                                ],
                                                spacing=10,
                                                horizontal_alignment=ft.CrossAxisAlignment.STRETCH,
                                            ),
                                            padding=ft.padding.all(15)
                                        ),
                                        elevation=2, shape=ft.RoundedRectangleBorder(radius=8),
                                        width=800,
                                    ),
                                    alignment=ft.alignment.center
                                ),
                            ],
                            spacing=20,
                            scroll=ft.ScrollMode.ADAPTIVE,
                            horizontal_alignment=ft.CrossAxisAlignment.STRETCH,
                        ),
                    ),
                    alignment=ft.alignment.top_center,
                ),
            ),
        ],
        expand=1,
    )

    page.add(
        tabs
    )
    page.update()

if __name__ == "__main__":
    ft.app(target=main)
