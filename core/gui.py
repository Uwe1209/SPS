import flet as ft
import threading
import re
import json
import shutil
import os
from finetune import main as finetune_main
from process_dataset import process_dataset

cancel_event = threading.Event()

def main(page: ft.Page):
    """Main function for the Flet GUI."""
    page.title = "SmartPlant AI Finetuner"
    page.theme_mode = ft.ThemeMode.LIGHT
    page.window_min_width = 600
    page.window_min_height = 800
    page.padding = 0
    page.vertical_alignment = ft.MainAxisAlignment.START
    page.horizontal_alignment = ft.CrossAxisAlignment.CENTER

    TEXT_FIELD_HEIGHT =48
    BUTTON_HEIGHT =48
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
            save_inputs()

    def on_save_dialog_result(e: ft.FilePickerResultEvent):
        if e.path:
            save_model_path.value = e.path
            page.update()
            save_inputs()

    def on_load_dialog_result(e: ft.FilePickerResultEvent):
        if e.files:
            load_model_path.value = e.files[0].path
            page.update()
            save_inputs()

    def on_source_dir_result(e: ft.FilePickerResultEvent):
        if e.path:
            source_dir_path.value = e.path
            page.update()
            save_inputs()

    def on_dest_dir_result(e: ft.FilePickerResultEvent):
        if e.path:
            dest_dir_path.value = e.path
            page.update()
            save_inputs()

    def start_processing(e):
        """Callback to start the dataset processing in a separate thread."""
        cancel_event.clear()
        cancel_button.visible = True
        cancel_button.disabled = False
        process_start_button.disabled = True
        toast_text.value = "Processing dataset..."
        toast_progress_bar.visible = False
        toast_progress_ring.visible = True
        toast_container.visible = True
        page.update()

        source_dir = source_dir_path.value
        dest_dir = dest_dir_path.value
        try:
            split_ratio = float(split_ratio_field.value)
        except (ValueError, TypeError):
            toast_text.value = "Invalid split ratio. Please enter a number between 0 and 1."
            toast_progress_ring.visible = False
            toast_container.visible = True
            process_start_button.disabled = False
            page.update()
            return

        def progress_callback(message):
            toast_text.value = message
            page.update()

        def run_processing():
            """Target function for the processing thread."""
            try:
                process_dataset(
                    source_dir=source_dir,
                    dest_dir=dest_dir,
                    split_ratio=split_ratio,
                    progress_callback=progress_callback,
                    cancel_event=cancel_event
                )
                if not cancel_event.is_set():
                    progress_callback("Dataset processing finished successfully.")
            except Exception as ex:
                progress_callback(f"An error occurred: {ex}")
            finally:
                process_start_button.disabled = False
                toast_progress_ring.visible = False
                cancel_button.visible = False
                page.update()

        thread = threading.Thread(target=run_processing)
        thread.start()

    def start_finetuning(e):
        """Callback to start the fine-tuning process in a separate thread."""
        cancel_event.clear()
        cancel_button.visible = True
        cancel_button.disabled = False
        start_button.disabled = True
        toast_text.value = "Starting fine-tuning..."
        toast_progress_ring.visible = False
        toast_progress_bar.value = 0
        toast_progress_bar.visible = True
        toast_container.visible = True
        page.update()

        settings = {
            'data_dir': data_dir_path.value,
            'model_name': model_dropdown.value or 'resnet18',
            'num_epochs': int(epochs_field.value) if epochs_field.value else 25,
            'batch_size': int(batch_size_field.value) if batch_size_field.value else 32,
            'learning_rate': float(learning_rate_field.value) if learning_rate_field.value else 0.001,
            'load_path': load_model_path.value or None,
            'save_path': save_model_path.value or None,
            'cancel_event': cancel_event,
        }

        def run_finetuning(settings_dict):
            """Target function for the training thread."""
            epoch_message = ""
            def progress_callback(message):
                nonlocal epoch_message
                if message.strip() == '-' * 10:
                    return
                
                epoch_match = re.search(r"Epoch (\d+)/(\d+)", message)
                if epoch_match:
                    epoch_message = message
                    toast_text.value = message
                    current_epoch = int(epoch_match.group(1))
                    total_epochs = int(epoch_match.group(2)) + 1
                    toast_progress_bar.value = (current_epoch + 1) / total_epochs
                else:
                    toast_text.value = f"{epoch_message}: {message}" if epoch_message else message

                page.update()

            try:
                final_accuracy = finetune_main(settings_dict, progress_callback=progress_callback)
                if not cancel_event.is_set():
                    progress_callback(f"Fine-tuning finished. Final validation accuracy: {final_accuracy:.4f}")
            except Exception as ex:
                progress_callback(f"An error occurred: {ex}")
            finally:
                start_button.disabled = False
                toast_progress_bar.visible = False
                cancel_button.visible = False
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
    def clear_dataset(e):
        dialog.open = False
        page.update()
        dest_dir = dest_dir_path.value
        if not dest_dir:
            toast_text.value = "Destination directory not set."
            toast_container.visible = True
            page.update()
            return
        
        try:
            train_path = os.path.join(dest_dir, 'train')
            val_path = os.path.join(dest_dir, 'val')
            if os.path.exists(train_path):
                shutil.rmtree(train_path)
            if os.path.exists(val_path):
                shutil.rmtree(val_path)
            toast_text.value = "Processed dataset cleared successfully."
        except Exception as ex:
            toast_text.value = f"Error clearing dataset: {ex}"
        
        toast_progress_ring.visible = False
        toast_progress_bar.visible = False
        toast_container.visible = True
        page.update()

    def close_dialog(e):
        dialog.open = False
        page.update()

    dialog = ft.AlertDialog(
        modal=True,
        title=ft.Text("Confirm Deletion"),
        content=ft.Text("Are you sure you want to clear the processed dataset directory? This action cannot be undone."),
        actions=[
            ft.TextButton("Yes", on_click=clear_dataset),
            ft.TextButton("No", on_click=close_dialog),
        ],
        actions_alignment=ft.MainAxisAlignment.END,
    )

    def confirm_clear_dataset(e):
        page.dialog = dialog
        dialog.open = True
        page.update()

    clear_dataset_button = ft.ElevatedButton(
        "Clear Processed Dataset",
        on_click=confirm_clear_dataset,
        icon=ft.Icons.DELETE_FOREVER,
        bgcolor=ft.Colors.RED_700,
        color=ft.Colors.WHITE,
        style=action_button_style,
        height=BUTTON_HEIGHT,
    )

    process_start_button = ft.ElevatedButton(
        text="Run Processing",
        on_click=start_processing,
        icon=ft.Icons.PLAY_ARROW,
        bgcolor=ft.Colors.GREEN_700,
        color=ft.Colors.WHITE,
        style=action_button_style,
        height=BUTTON_HEIGHT,
    )

    model_dropdown = ft.Dropdown(
        label="Select Model",
        options=[
            ft.dropdown.Option("resnet18"),
            ft.dropdown.Option("vgg16"),
            ft.dropdown.Option("alexnet"),
            ft.dropdown.Option("googlenet"),
            ft.dropdown.Option("mobilenet_v2"),
            ft.dropdown.Option("mobilenet_v3_large"),
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
    toast_text = ft.Text(color=ft.Colors.WHITE)
    toast_progress_bar = ft.ProgressBar(visible=False, color=ft.Colors.GREEN_400, bgcolor=ft.Colors.GREY_400)
    toast_progress_ring = ft.ProgressRing(visible=False, color=ft.Colors.GREEN_400, bgcolor=ft.Colors.GREY_400)

    def cancel_operation(e):
        toast_text.value = "Cancelling..."
        cancel_button.disabled = True
        page.update()
        cancel_event.set()

    cancel_button = ft.ElevatedButton("Cancel", on_click=cancel_operation, visible=False, bgcolor=ft.Colors.RED, color=ft.Colors.WHITE)

    toast_container = ft.Container(
        content=ft.Column([
            toast_text,
            toast_progress_bar,
            toast_progress_ring,
            cancel_button,
        ], spacing=10),
        bgcolor=ft.Colors.GREY_800,
        padding=15,
        border_radius=10,
        right=20,
        bottom=20,
        visible=False,
        width=400,
        animate_opacity=300,
    )

    page.overlay.append(toast_container)

    tabs = ft.Tabs(
        selected_index=0,
        animation_duration=300,
        tabs=[
            ft.Tab(
                text="Process Dataset",
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
                                ),
                                ft.Container(
                                    content=ft.Card(
                                        content=ft.Container(
                                            content=ft.Column(
                                                [
                                                    ft.Text("Actions", theme_style=ft.TextThemeStyle.TITLE_MEDIUM),
                                                    process_start_button,
                                                    clear_dataset_button,
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
                                    padding=ft.padding.only(bottom=20),
                                ),
                            ],
                            spacing=20,
                            scroll=ft.ScrollMode.ADAPTIVE,
                            horizontal_alignment=ft.CrossAxisAlignment.STRETCH,
                        ),
                    alignment=ft.alignment.top_center,
                ),
            ),
            ft.Tab(
                text="Fine-Tuning",
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
                                    padding=ft.padding.only(bottom=20),
                                ),
                            ],
                            spacing=20,
                            scroll=ft.ScrollMode.ADAPTIVE,
                            horizontal_alignment=ft.CrossAxisAlignment.STRETCH,
                        ),
                    alignment=ft.alignment.top_center,
                ),
            ),
        ],
        expand=1,
    )

    APP_SETTINGS_KEY = "app_settings"

    controls_to_save = {
        "source_dir_path": source_dir_path, "dest_dir_path": dest_dir_path,
        "split_ratio_field": split_ratio_field, "data_dir_path": data_dir_path,
        "save_model_path": save_model_path, "load_model_path": load_model_path,
        "model_dropdown": model_dropdown, "epochs_field": epochs_field,
        "batch_size_field": batch_size_field, "learning_rate_field": learning_rate_field,
    }

    def save_inputs(e=None):
        settings = {key: control.value for key, control in controls_to_save.items()}
        page.client_storage.set(APP_SETTINGS_KEY, json.dumps(settings))

    def load_inputs():
        settings_str = page.client_storage.get(APP_SETTINGS_KEY)
        if settings_str:
            settings = json.loads(settings_str)
            for key, control in controls_to_save.items():
                if key in settings:
                    control.value = settings[key]
            page.update()

    for control in controls_to_save.values():
        control.on_change = save_inputs

    load_inputs()

    page.add(
        tabs
    )
    page.update()

if __name__ == "__main__":
    ft.app(target=main)
