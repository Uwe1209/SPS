import flet as ft
import threading
import re
import json
import shutil
import os
from finetune import main as finetune_main
from process_dataset import process_dataset

cancel_event = threading.Event()
toast_hide_timer = None

def hide_toast(page: ft.Page):
    """Hides the toast notification."""
    # The toast container is the last overlay.
    if page.overlay:
        toast_container = page.overlay[-1]
        if isinstance(toast_container, ft.Container):
            toast_container.visible = False
            page.update()

def main(page: ft.Page):
    """Main function for the Flet GUI."""
    page.title = "SmartPlant AI Finetuner"
    page.theme_mode = ft.ThemeMode.DARK
    page.window_min_width = 600
    page.window_min_height = 800
    page.bgcolor = ft.Colors.BLACK
    page.padding = 0
    page.vertical_alignment = ft.MainAxisAlignment.START
    page.horizontal_alignment = ft.CrossAxisAlignment.CENTER

    TEXT_FIELD_HEIGHT =48
    BUTTON_HEIGHT =48

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

    def show_test_toast(text=None, ring=False, bar=False, button=False):
        """Helper to show toast for UI testing."""
        global toast_hide_timer
        if toast_hide_timer:
            toast_hide_timer.cancel()
        
        toast_text.value = text or ""
        toast_progress_ring.visible = ring
        toast_progress_bar.visible = bar
        if bar:
            toast_progress_bar.value = None  # Indeterminate

        cancel_button.visible = button
        cancel_button.disabled = not button

        toast_container.visible = True
        page.update()

        if not button:  # Auto-hide if there's no cancel button
            toast_hide_timer = threading.Timer(5.0, lambda: hide_toast(page))
            toast_hide_timer.start()

    def on_toast_only(e):
        show_test_toast()

    def on_toast_with_text(e):
        show_test_toast(text="This is a toast with text.")

    def on_toast_with_loading_and_text(e):
        show_test_toast(text="Loading...", ring=True)

    def on_toast_with_loading_text_and_button(e):
        show_test_toast(text="Long process...", bar=True, button=True)

    def start_processing(e):
        """Callback to start the dataset processing in a separate thread."""
        global toast_hide_timer
        if toast_hide_timer:
            toast_hide_timer.cancel()
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
                global toast_hide_timer
                toast_hide_timer = threading.Timer(5.0, lambda: hide_toast(page))
                toast_hide_timer.start()

        processing_thread = threading.Thread(target=run_processing)
        processing_thread.start()

    def start_finetuning(e):
        """Callback to start the fine-tuning process in a separate thread."""
        global toast_hide_timer
        if toast_hide_timer:
            toast_hide_timer.cancel()
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
                global toast_hide_timer
                toast_hide_timer = threading.Timer(5.0, lambda: hide_toast(page))
                toast_hide_timer.start()

        finetuning_thread = threading.Thread(target=run_finetuning, args=(settings,))
        finetuning_thread.start()

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

    clear_confirmation_timer = None

    def run_clear_dataset_thread():
        """Background thread to clear the dataset directory."""
        dest_dir = dest_dir_path.value
        if not dest_dir:
            toast_text.value = "Destination directory not set."
        else:
            train_path = os.path.join(dest_dir, 'train')
            val_path = os.path.join(dest_dir, 'val')
            
            try:
                if os.path.exists(train_path):
                    shutil.rmtree(train_path)
                if os.path.exists(val_path):
                    shutil.rmtree(val_path)
                
                # Verify deletion
                if os.path.exists(train_path) or os.path.exists(val_path):
                    toast_text.value = "Error: Failed to delete dataset directories. Please check file permissions."
                else:
                    toast_text.value = "Processed dataset cleared successfully."

            except Exception as ex:
                toast_text.value = f"Error clearing dataset: {ex}"
        
        toast_progress_ring.visible = False
        page.update()
        global toast_hide_timer
        toast_hide_timer = threading.Timer(5.0, lambda: hide_toast(page))
        toast_hide_timer.start()

    def reset_clear_button():
        """Resets the clear button to its original state."""
        nonlocal clear_confirmation_timer
        if clear_confirmation_timer:
            clear_confirmation_timer.cancel()
            clear_confirmation_timer = None
        
        clear_dataset_button.text = "Clear Processed Dataset"
        clear_dataset_button.bgcolor = ft.Colors.GREY_800
        page.update()

    def on_page_click(e):
        """Cancels clear confirmation if a click occurs outside the button."""
        if clear_confirmation_timer and clear_confirmation_timer.is_alive():
            if e.control != clear_dataset_button:
                reset_clear_button()

    page.on_click = on_page_click

    def confirm_clear_dataset(e):
        """Handles the two-stage confirmation for clearing the dataset."""
        nonlocal clear_confirmation_timer

        if clear_confirmation_timer and clear_confirmation_timer.is_alive():
            # Second click: confirmation received
            clear_confirmation_timer.cancel()
            clear_confirmation_timer = None

            global toast_hide_timer
            if toast_hide_timer:
                toast_hide_timer.cancel()
            
            clear_dataset_button.text = "Clear Processed Dataset"
            clear_dataset_button.bgcolor = ft.Colors.GREY_800
            
            toast_text.value = "Clearing processed dataset..."
            toast_progress_ring.visible = True
            toast_progress_bar.visible = False
            toast_container.visible = True
            page.update()

            clear_thread = threading.Thread(target=run_clear_dataset_thread)
            clear_thread.start()
        else:
            # First click: ask for confirmation
            clear_dataset_button.text = "Confirm Clear?"
            clear_dataset_button.bgcolor = ft.Colors.GREY_700
            page.update()
            
            clear_confirmation_timer = threading.Timer(5.0, reset_clear_button)
            clear_confirmation_timer.start()

    clear_dataset_button = ft.ElevatedButton(
        "Clear Processed Dataset",
        on_click=confirm_clear_dataset,
        icon=ft.Icons.DELETE_FOREVER,
        bgcolor=ft.Colors.GREY_800,
        color=ft.Colors.WHITE,
        style=action_button_style,
        height=BUTTON_HEIGHT,
    )

    process_start_button = ft.ElevatedButton(
        text="Run Processing",
        on_click=start_processing,
        icon=ft.Icons.PLAY_ARROW,
        bgcolor=ft.Colors.GREY_800,
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
        border_color=ft.Colors.GREY_700,
        focused_border_color=ft.Colors.GREY_600,
        expand=True,
    )
    epochs_field = ft.TextField(label="Number of Epochs", value="25", height=TEXT_FIELD_HEIGHT)
    batch_size_field = ft.TextField(label="Batch Size", value="32", height=TEXT_FIELD_HEIGHT)
    learning_rate_field = ft.TextField(label="Learning Rate", value="0.001", height=TEXT_FIELD_HEIGHT)
    start_button = ft.ElevatedButton(
        text="Run Fine-Tuning",
        on_click=start_finetuning,
        icon=ft.Icons.MODEL_TRAINING,
        bgcolor=ft.Colors.GREY_800,
        color=ft.Colors.WHITE,
        style=action_button_style,
        height=BUTTON_HEIGHT,
    )
    toast_text = ft.Text(color=ft.Colors.WHITE, expand=True)
    toast_progress_bar = ft.ProgressBar(visible=False, color=ft.Colors.GREY_500)
    toast_progress_ring = ft.ProgressRing(visible=False, color=ft.Colors.GREY_500)

    def cancel_operation(e):
        toast_text.value = "Cancelling..."
        cancel_button.disabled = True
        page.update()
        cancel_event.set()

    cancel_button = ft.ElevatedButton("Cancel", on_click=cancel_operation, visible=False, bgcolor=ft.Colors.GREY_800, color=ft.Colors.WHITE, expand=True)

    toast_container = ft.Container(
        content=ft.Column([
            ft.Row(
                [toast_text, toast_progress_ring],
                spacing=10,
                vertical_alignment=ft.CrossAxisAlignment.CENTER,
            ),
            toast_progress_bar,
            ft.Row([cancel_button]),
        ], spacing=10),
        bgcolor=ft.Colors.GREY_900,
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
                                                                bgcolor=ft.Colors.GREY_800,
                                                                color=ft.Colors.WHITE,
                                                                style=beside_button_style,
                                                                expand=0.3,
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
                                                                bgcolor=ft.Colors.GREY_800,
                                                                color=ft.Colors.WHITE,
                                                                style=beside_button_style,
                                                                expand=0.3,
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
                                                                bgcolor=ft.Colors.GREY_800,
                                                                color=ft.Colors.WHITE,
                                                                style=beside_button_style,
                                                                expand=0.3,
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
                                                                bgcolor=ft.Colors.GREY_800,
                                                                color=ft.Colors.WHITE,
                                                                style=beside_button_style,
                                                                expand=0.3,
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
                                                                bgcolor=ft.Colors.GREY_800,
                                                                color=ft.Colors.WHITE,
                                                                style=beside_button_style,
                                                                expand=0.3,
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
            ft.Tab(
                text="UI Testing",
                content=ft.Container(
                    content=ft.Column(
                        [
                            ft.Container(
                                content=ft.Card(
                                    content=ft.Container(
                                        content=ft.Column(
                                            [
                                                ft.Text("Toast Tests", theme_style=ft.TextThemeStyle.TITLE_MEDIUM),
                                                ft.ElevatedButton(
                                                    "Show Toast Only",
                                                    on_click=on_toast_only,
                                                    style=action_button_style,
                                                    height=BUTTON_HEIGHT,
                                                ),
                                                ft.ElevatedButton(
                                                    "Show Toast with Text",
                                                    on_click=on_toast_with_text,
                                                    style=action_button_style,
                                                    height=BUTTON_HEIGHT,
                                                ),
                                                ft.ElevatedButton(
                                                    "Show Toast with Loading and Text",
                                                    on_click=on_toast_with_loading_and_text,
                                                    style=action_button_style,
                                                    height=BUTTON_HEIGHT,
                                                ),
                                                ft.ElevatedButton(
                                                    "Show Toast with Loading, Text, and Button",
                                                    on_click=on_toast_with_loading_text_and_button,
                                                    style=action_button_style,
                                                    height=BUTTON_HEIGHT,
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
                                padding=ft.padding.only(top=20, bottom=20),
                            ),
                        ],
                        spacing=20,
                        scroll=ft.ScrollMode.ADAPTIVE,
                        horizontal_alignment=ft.CrossAxisAlignment.STRETCH,
                    ),
                    alignment=ft.alignment.top_center,
                )
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
