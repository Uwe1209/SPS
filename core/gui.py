import flet as ft
import threading
import random
import re
import json
import shutil
import os
from finetune import main as finetune_main
from process_dataset import process_dataset

cancel_event = threading.Event()
toast_hide_timer = None

def hide_toast(page: ft.Page):
    """Hides the toast notification"""
    # The toast container is the last overlay
    if page.overlay:
        toast_container = page.overlay[-1]
        if isinstance(toast_container, ft.Container):
            toast_container.visible = False
            page.update()

def main(page: ft.Page):
    """Main function for the Flet GUI"""
    page.title = "Core"
    page.theme_mode = ft.ThemeMode.DARK
    page.window_min_width = 640
    page.window_min_height = 360
    page.bgcolor = ft.Colors.BLACK
    page.padding = 0
    page.vertical_alignment = ft.MainAxisAlignment.START
    page.horizontal_alignment = ft.CrossAxisAlignment.CENTER

    TEXT_FIELD_HEIGHT = 48
    BUTTON_HEIGHT = 48

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

    def generate_process_seed(e):
        """Generates a random seed for the processing seed field"""
        process_seed_field.value = str(random.randint(1000000000, 9999999999))
        page.update()
        save_inputs()

    def generate_finetune_seed(e):
        """Generates a random seed for the fine-tuning seed field"""
        finetune_seed_field.value = str(random.randint(1000000000, 9999999999))
        page.update()
        save_inputs()

    def start_processing(e):
        """Callback to start the dataset processing in a separate thread"""
        global toast_hide_timer
        if toast_hide_timer:
            toast_hide_timer.cancel()
        cancel_event.clear()
        cancel_button_row.visible = True
        cancel_button.disabled = False
        process_start_button.disabled = True
        toast_text.value = "Processing dataset"
        toast_progress_bar.visible = False
        toast_progress_ring.visible = True
        toast_container.visible = True
        page.update()

        source_dir = source_dir_path.value
        dest_dir = dest_dir_path.value
        try:
            train_ratio = float(train_ratio_field.value)
            val_ratio = float(val_ratio_field.value)
            test_ratio = float(test_ratio_field.value)
            resolution = int(resolution_field.value)
            # Validate new fields
            if image_extensions_field.value:
                _ = {ext.strip() for ext in image_extensions_field.value.split(',')}

            if not (0 <= train_ratio <= 100 and 0 <= val_ratio <= 100 and 0 <= test_ratio <= 100):
                raise ValueError("Ratios must be between 0 and 100")
            if train_ratio + val_ratio + test_ratio > 100:
                raise ValueError("The sum of ratios cannot exceed 100")
            if not resolution > 0:
                raise ValueError("Resolution must be a positive number")
            if process_seed_field.value:
                int(process_seed_field.value)

        except (ValueError, TypeError) as ex:
            if "cannot exceed 100" in str(ex) or "between 0 and 100" in str(ex) or "positive number" in str(ex):
                toast_text.value = str(ex)
            else:
                toast_text.value = "Invalid number in one of the fields. Please check ratios, resolution, and seed."
            toast_progress_ring.visible = False
            cancel_button_row.visible = False
            toast_container.visible = True
            process_start_button.disabled = False
            page.update()
            toast_hide_timer = threading.Timer(5.0, lambda: hide_toast(page))
            toast_hide_timer.start()
            return

        def progress_callback(message):
            toast_text.value = message
            page.update()

        def run_processing():
            """Target function for the processing thread"""
            try:
                seed_value = int(process_seed_field.value) if process_seed_field.value else None
                process_dataset(
                    source_dir=source_dir,
                    dest_dir=dest_dir,
                    train_ratio=train_ratio / 100.0,
                    val_ratio=val_ratio / 100.0,
                    test_ratio=test_ratio / 100.0,
                    resolution=resolution,
                    seed=seed_value,
                    progress_callback=progress_callback,
                    cancel_event=cancel_event,
                    image_extensions=image_extensions_field.value,
                    color_mode=color_mode_dropdown.value,
                    overwrite_dest=overwrite_dest_switch.value,
                    load_truncated_images=load_truncated_images_switch.value
                )
                if not cancel_event.is_set():
                    progress_callback("Dataset processing finished successfully")
            except Exception as ex:
                progress_callback(f"An error occurred: {ex}")
            finally:
                process_start_button.disabled = False
                toast_progress_ring.visible = False
                cancel_button_row.visible = False
                page.update()
                global toast_hide_timer
                toast_hide_timer = threading.Timer(5.0, lambda: hide_toast(page))
                toast_hide_timer.start()

        processing_thread = threading.Thread(target=run_processing)
        processing_thread.start()

    def start_finetuning(e):
        """Callback to start the fine-tuning process in a separate thread"""
        global toast_hide_timer
        if toast_hide_timer:
            toast_hide_timer.cancel()
        cancel_event.clear()
        cancel_button_row.visible = True
        cancel_button.disabled = False
        start_button.disabled = True
        toast_text.value = "Starting fine-tuning"
        toast_progress_bar.visible = False
        toast_progress_ring.value = 0
        toast_progress_ring.visible = True
        toast_container.visible = True
        page.update()

        try:
            settings = {
                'data_dir': data_dir_path.value,
                'model_name': model_name_field.value or 'resnet18',
                'num_epochs': int(epochs_field.value) if epochs_field.value else 25,
                'batch_size': int(batch_size_field.value) if batch_size_field.value else 32,
                'learning_rate': float(learning_rate_field.value) if learning_rate_field.value else 0.001,
                'dropout_rate': float(dropout_rate_field.value) if dropout_rate_field.value else 0.0,
                'optimiser': optimiser_dropdown.value or 'adamw',
                'early_stopping_patience': int(early_stopping_patience_field.value) if early_stopping_switch.value and early_stopping_patience_field.value else 0,
                'early_stopping_min_delta': float(early_stopping_min_delta_field.value) if early_stopping_switch.value and early_stopping_min_delta_field.value else 0.0,
                'early_stopping_metric': early_stopping_metric_dropdown.value or 'loss',
                'mixed_precision': mixed_precision_switch.value,
                'sgd_momentum': float(sgd_momentum_field.value) if sgd_momentum_field.value else 0.9,
                'adam_beta1': float(adam_beta1_field.value) if adam_beta1_field.value else 0.9,
                'adam_beta2': float(adam_beta2_field.value) if adam_beta2_field.value else 0.999,
                'adam_eps': float(adam_eps_field.value) if adam_eps_field.value else 1e-8,
                'weight_decay': float(weight_decay_field.value) if weight_decay_field.value else 0.0,
                'loss_function': loss_function_dropdown.value or 'cross_entropy',
                'label_smoothing_factor': float(label_smoothing_factor_field.value) if label_smoothing_factor_field.value else 0.1,
                'use_imagenet_norm': use_imagenet_norm_switch.value,
                'norm_mean': norm_mean_field.value,
                'norm_std': norm_std_field.value,
                'input_size': int(input_size_field.value) if input_size_field.value else 224,
                'resize_size': int(resize_size_field.value) if resize_size_field.value else int((int(input_size_field.value) if input_size_field.value else 224) / 224 * 256),
                'num_workers': int(num_workers_field.value) if num_workers_field.value else 0,
                'train_from_scratch': train_from_scratch_switch.value,
                'strict_load': strict_load_switch.value,
                'load_path': load_model_path.value or None,
                'save_path': save_model_path.value or None,
                'cancel_event': cancel_event,
                'aug_random_resized_crop': aug_random_resized_crop_switch.value,
                'aug_horizontal_flip': aug_horizontal_flip_switch.value,
                'aug_rotation': aug_rotation_switch.value,
                'aug_rotation_degrees': int(aug_rotation_degrees_field.value) if aug_rotation_degrees_field.value else 15,
                'aug_color_jitter': aug_color_jitter_switch.value,
                'aug_color_jitter_brightness': float(aug_color_jitter_brightness_field.value) if aug_color_jitter_brightness_field.value else 0.2,
                'aug_color_jitter_contrast': float(aug_color_jitter_contrast_field.value) if aug_color_jitter_contrast_field.value else 0.2,
                'aug_color_jitter_saturation': float(aug_color_jitter_saturation_field.value) if aug_color_jitter_saturation_field.value else 0.2,
                'aug_color_jitter_hue': float(aug_color_jitter_hue_field.value) if aug_color_jitter_hue_field.value else 0.1,
                'aug_crop_scale_min': float(aug_crop_scale_min_field.value) if aug_crop_scale_min_field.value else 0.08,
                'aug_crop_scale_max': float(aug_crop_scale_max_field.value) if aug_crop_scale_max_field.value else 1.0,
                'aug_crop_ratio_min': float(aug_crop_ratio_min_field.value) if aug_crop_ratio_min_field.value else 0.75,
                'aug_crop_ratio_max': float(aug_crop_ratio_max_field.value) if aug_crop_ratio_max_field.value else 1.33,
                'pin_memory': pin_memory_switch.value,
                'load_truncated_images': load_truncated_images_switch.value,
                'seed': int(finetune_seed_field.value) if finetune_seed_field.value else None,
            }
        except (ValueError, TypeError):
            toast_text.value = "Invalid number in one of the fields. Please check hyperparameters and seed."
            toast_progress_ring.visible = False
            cancel_button_row.visible = False
            start_button.disabled = False
            page.update()
            toast_hide_timer = threading.Timer(5.0, lambda: hide_toast(page))
            toast_hide_timer.start()
            return

        def run_finetuning(settings_dict):
            """Target function for the training thread"""
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
                    toast_progress_ring.value = (current_epoch + 1) / total_epochs
                else:
                    toast_text.value = f"{epoch_message}: {message}" if epoch_message else message

                page.update()

            try:
                results = finetune_main(settings_dict, progress_callback=progress_callback)
                if not cancel_event.is_set():
                    val_acc = results.get('val_acc', 0.0)
                    test_acc = results.get('test_acc')
                    
                    message = f"Fine-tuning finished. Final validation accuracy: {val_acc:.4f}"
                    if test_acc is not None:
                        message += f". Test accuracy: {test_acc:.4f}"
                    progress_callback(message)
            except Exception as ex:
                progress_callback(f"An error occurred: {ex}")
            finally:
                start_button.disabled = False
                toast_progress_ring.visible = False
                cancel_button_row.visible = False
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

    data_dir_path = ft.TextField(label="Dataset directory", read_only=True, border_width=0.5, height=TEXT_FIELD_HEIGHT, expand=3)
    save_model_path = ft.TextField(label="Save model path", read_only=True, border_width=0.5, height=TEXT_FIELD_HEIGHT, expand=3)
    load_model_path = ft.TextField(label="Load model path", read_only=True, border_width=0.5, height=TEXT_FIELD_HEIGHT, expand=3)

    source_dir_path = ft.TextField(label="Source directory", read_only=True, border_width=0.5, height=TEXT_FIELD_HEIGHT, expand=3)
    dest_dir_path = ft.TextField(label="Destination directory", read_only=True, border_width=0.5, height=TEXT_FIELD_HEIGHT, expand=3)
    train_ratio_field = ft.TextField(label="Train ratio (%)", value="80", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)
    val_ratio_field = ft.TextField(label="Validation ratio (%)", value="10", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)
    test_ratio_field = ft.TextField(label="Test ratio (%)", value="10", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)
    resolution_field = ft.TextField(label="Resolution (px)", value="224", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)
    image_extensions_field = ft.TextField(label="Image extensions", value=".jpg,.jpeg,.png", height=TEXT_FIELD_HEIGHT, expand=True)
    color_mode_dropdown = ft.Dropdown(
        label="Color mode",
        value="RGB",
        options=[
            ft.dropdown.Option("RGB"),
            ft.dropdown.Option("L"),
            ft.dropdown.Option("RGBA"),
        ],
        border_radius=8,
        border_color=ft.Colors.GREY_700,
        focused_border_color=ft.Colors.GREY_600,
        expand=True,
    )
    process_seed_field = ft.TextField(label="Seed (optional)", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=3)
    overwrite_dest_switch = ft.Switch(value=False)

    def run_clear_dataset_thread():
        """Background thread to clear the dataset directory"""
        dest_dir = dest_dir_path.value
        if not dest_dir:
            toast_text.value = "Destination directory not set"
        else:
            train_path = os.path.join(dest_dir, 'train')
            val_path = os.path.join(dest_dir, 'val')
            test_path = os.path.join(dest_dir, 'test')
            
            try:
                if os.path.exists(train_path):
                    shutil.rmtree(train_path)
                if os.path.exists(val_path):
                    shutil.rmtree(val_path)
                if os.path.exists(test_path):
                    shutil.rmtree(test_path)
                
                # Verify deletion
                if os.path.exists(train_path) or os.path.exists(val_path) or os.path.exists(test_path):
                    toast_text.value = "Error: Failed to delete dataset directories. Please check file permissions"
                else:
                    toast_text.value = "Processed dataset cleared successfully"

            except Exception as ex:
                toast_text.value = f"Error clearing dataset: {ex}"
        
        toast_progress_ring.visible = False
        page.update()
        global toast_hide_timer
        toast_hide_timer = threading.Timer(5.0, lambda: hide_toast(page))
        toast_hide_timer.start()

    def clear_dataset(e):
        """Handles clearing the dataset"""
        global toast_hide_timer
        if toast_hide_timer:
            toast_hide_timer.cancel()
    
        toast_text.value = "Clearing processed dataset"
        toast_progress_ring.visible = True
        toast_progress_bar.visible = False
        toast_container.visible = True
        page.update()

        clear_thread = threading.Thread(target=run_clear_dataset_thread)
        clear_thread.start()

    clear_dataset_button = ft.ElevatedButton(
        "Clear processed dataset",
        on_click=clear_dataset,
        icon=ft.Icons.DELETE_FOREVER,
        bgcolor=ft.Colors.GREY_800,
        color=ft.Colors.WHITE,
        style=action_button_style,
        height=BUTTON_HEIGHT,
        expand=True,
    )

    process_start_button = ft.ElevatedButton(
        text="Run processing",
        on_click=start_processing,
        icon=ft.Icons.PLAY_ARROW,
        bgcolor=ft.Colors.GREY_800,
        color=ft.Colors.WHITE,
        style=action_button_style,
        height=BUTTON_HEIGHT,
        expand=True,
    )

    model_name_field = ft.TextField(
        label="Model name (e.g., from timm or Hugging Face)",
        value="resnet18",
        height=TEXT_FIELD_HEIGHT,
        expand=True,
    )
    epochs_field = ft.TextField(label="Number of epochs", value="25", height=TEXT_FIELD_HEIGHT)
    batch_size_field = ft.TextField(label="Batch size", value="32", height=TEXT_FIELD_HEIGHT)
    learning_rate_field = ft.TextField(label="Learning rate", value="0.001", height=TEXT_FIELD_HEIGHT)
    input_size_field = ft.TextField(label="Input size (px)", value="224", height=TEXT_FIELD_HEIGHT)
    resize_size_field = ft.TextField(label="Resize size (px)", value="256", height=TEXT_FIELD_HEIGHT)
    num_workers_field = ft.TextField(label="Data loader workers", value="0", height=TEXT_FIELD_HEIGHT)
    train_from_scratch_switch = ft.Switch(value=False)
    strict_load_switch = ft.Switch(value=False)
    dropout_rate_field = ft.TextField(label="Dropout rate", value="0.0", height=TEXT_FIELD_HEIGHT)
    mixed_precision_switch = ft.Switch(value=False)
    early_stopping_switch = ft.Switch(value=False)
    early_stopping_patience_field = ft.TextField(label="Patience", value="5", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)
    early_stopping_min_delta_field = ft.TextField(label="Min delta", value="0.001", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)
    early_stopping_metric_dropdown = ft.Dropdown(
        label="Early Stopping Metric",
        value="loss",
        options=[
            ft.dropdown.Option("loss"),
            ft.dropdown.Option("accuracy"),
        ],
        border_radius=8,
        border_color=ft.Colors.GREY_700,
        focused_border_color=ft.Colors.GREY_600,
        expand=True,
    )
    pin_memory_switch = ft.Switch(value=False)
    
    sgd_momentum_field = ft.TextField(label="SGD Momentum", value="0.9", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)
    adam_beta1_field = ft.TextField(label="Adam/W Beta1", value="0.9", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)
    adam_beta2_field = ft.TextField(label="Adam/W Beta2", value="0.999", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)
    adam_eps_field = ft.TextField(label="Adam/W Epsilon", value="1e-8", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)
    weight_decay_field = ft.TextField(label="Weight Decay", value="0.0", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)

    loss_function_dropdown = ft.Dropdown(
        label="Loss Function",
        value="cross_entropy",
        options=[
            ft.dropdown.Option("cross_entropy"),
            ft.dropdown.Option("label_smoothing"),
        ],
        border_radius=8,
        border_color=ft.Colors.GREY_700,
        focused_border_color=ft.Colors.GREY_600,
        expand=True,
    )
    label_smoothing_factor_field = ft.TextField(label="Label Smoothing Factor", value="0.1", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True, disabled=True)

    def toggle_label_smoothing_field(e):
        is_ls = loss_function_dropdown.value == 'label_smoothing'
        label_smoothing_factor_field.disabled = not is_ls
        page.update()
        save_inputs()

    def toggle_norm_fields(e):
        is_custom = not use_imagenet_norm_switch.value
        norm_mean_field.disabled = not is_custom
        norm_std_field.disabled = not is_custom
        page.update()
        save_inputs()

    use_imagenet_norm_switch = ft.Switch(value=True)
    norm_mean_field = ft.TextField(label="Normalisation Mean (comma-separated)", value="0.485, 0.456, 0.406", height=TEXT_FIELD_HEIGHT, expand=True, disabled=True)
    norm_std_field = ft.TextField(label="Normalisation Std Dev (comma-separated)", value="0.229, 0.224, 0.225", height=TEXT_FIELD_HEIGHT, expand=True, disabled=True)
    load_truncated_images_switch = ft.Switch(value=True)

    optimiser_dropdown = ft.Dropdown(
        label="Optimiser",
        value="adamw",
        options=[
            ft.dropdown.Option("adam"),
            ft.dropdown.Option("adamw"),
            ft.dropdown.Option("sgd"),
        ],
        border_radius=8,
        border_color=ft.Colors.GREY_700,
        focused_border_color=ft.Colors.GREY_600,
        expand=True,
    )
    finetune_seed_field = ft.TextField(label="Seed (optional)", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=3)
    
    aug_random_resized_crop_switch = ft.Switch(value=True)
    aug_horizontal_flip_switch = ft.Switch(value=True)
    aug_rotation_switch = ft.Switch(value=True)
    aug_rotation_degrees_field = ft.TextField(label="Rotation degrees", value="15", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)
    aug_color_jitter_switch = ft.Switch(value=True)
    aug_color_jitter_brightness_field = ft.TextField(label="Brightness", value="0.2", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)
    aug_color_jitter_contrast_field = ft.TextField(label="Contrast", value="0.2", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)
    aug_color_jitter_saturation_field = ft.TextField(label="Saturation", value="0.2", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)
    aug_color_jitter_hue_field = ft.TextField(label="Hue", value="0.1", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)
    aug_crop_scale_min_field = ft.TextField(label="Min Scale", value="0.08", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)
    aug_crop_scale_max_field = ft.TextField(label="Max Scale", value="1.0", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)
    aug_crop_ratio_min_field = ft.TextField(label="Min Ratio", value="0.75", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)
    aug_crop_ratio_max_field = ft.TextField(label="Max Ratio", value="1.33", height=TEXT_FIELD_HEIGHT, text_align=ft.TextAlign.CENTER, expand=True)

    start_button = ft.ElevatedButton(
        text="Run fine-tuning",
        on_click=start_finetuning,
        icon=ft.Icons.MODEL_TRAINING,
        bgcolor=ft.Colors.GREY_800,
        color=ft.Colors.WHITE,
        style=action_button_style,
        height=BUTTON_HEIGHT,
    )
    toast_text = ft.Text(color=ft.Colors.WHITE, expand=True)
    toast_progress_bar = ft.ProgressBar(visible=False, color=ft.Colors.GREY_500)
    toast_progress_ring = ft.ProgressRing(visible=False, color=ft.Colors.GREY_500, width=20, height=20)

    def cancel_operation(e):
        toast_text.value = "Cancelling"
        cancel_button.disabled = True
        page.update()
        cancel_event.set()

    cancel_button = ft.ElevatedButton("Cancel", on_click=cancel_operation, bgcolor=ft.Colors.GREY_800, color=ft.Colors.WHITE, expand=True)
    cancel_button_row = ft.Row([cancel_button], visible=False)

    toast_container = ft.Container(
        content=ft.Column([
            ft.Row(
                [toast_text, toast_progress_ring],
                spacing=10,
                vertical_alignment=ft.CrossAxisAlignment.CENTER,
            ),
            toast_progress_bar,
            cancel_button_row,
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
                text="Process dataset",
                content=ft.Container(
                    content=ft.Column(
                        [
                            ft.Container(
                                content=ft.Card(
                                    content=ft.Container(
                                        content=ft.Column(
                                            [
                                                ft.Text("Directories", theme_style=ft.TextThemeStyle.TITLE_MEDIUM),
                                                ft.Divider(),
                                                ft.Row(
                                                    [
                                                        source_dir_path,
                                                        ft.ElevatedButton(
                                                            "Select source",
                                                            icon=ft.Icons.FOLDER_OPEN,
                                                            on_click=lambda _: source_dir_picker.get_directory_path(
                                                                dialog_title="Select source directory"
                                                            ),
                                                            bgcolor=ft.Colors.GREY_800,
                                                            color=ft.Colors.WHITE,
                                                            style=beside_button_style,
                                                            expand=1,
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
                                                            "Select destination",
                                                            icon=ft.Icons.FOLDER_OPEN,
                                                            on_click=lambda _: dest_dir_picker.get_directory_path(
                                                                dialog_title="Select destination directory"
                                                            ),
                                                            bgcolor=ft.Colors.GREY_800,
                                                            color=ft.Colors.WHITE,
                                                            style=beside_button_style,
                                                            expand=1,
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
                                                ft.Divider(),
                                                ft.Row(
                                                    [
                                                        train_ratio_field,
                                                        val_ratio_field,
                                                        test_ratio_field,
                                                        resolution_field,
                                                    ],
                                                    spacing=10,
                                                ),
                                                ft.Row(
                                                    [
                                                        image_extensions_field,
                                                        color_mode_dropdown,
                                                    ],
                                                    spacing=10,
                                                ),
                                                ft.Row(
                                                    [
                                                        process_seed_field,
                                                        ft.ElevatedButton(
                                                            "Generate",
                                                            icon=ft.Icons.CASINO,
                                                            on_click=generate_process_seed,
                                                            bgcolor=ft.Colors.GREY_800,
                                                            color=ft.Colors.WHITE,
                                                            style=beside_button_style,
                                                            expand=1,
                                                            height=BUTTON_HEIGHT,
                                                        ),
                                                    ],
                                                    spacing=10,
                                                ),
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
                                                ft.Divider(),
                                                ft.Row(
                                                    [
                                                        process_start_button,
                                                        clear_dataset_button,
                                                    ],
                                                    spacing=10,
                                                    alignment=ft.MainAxisAlignment.CENTER,
                                                ),
                                                ft.Divider(),
                                                ft.Row(
                                                    [
                                                        ft.Text("Overwrite destination", expand=True),
                                                        overwrite_dest_switch,
                                                    ],
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
                                padding=ft.padding.only(bottom=20),
                            ),
                        ],
                        spacing=10,
                        scroll=ft.ScrollMode.ADAPTIVE,
                        horizontal_alignment=ft.CrossAxisAlignment.STRETCH,
                    ),
                    alignment=ft.alignment.top_center,
                ),
            ),
            ft.Tab(
                text="Fine-tuning",
                content=ft.Container(
                    content=ft.Column(
                        [
                            ft.Container(
                                content=ft.Card(
                                    content=ft.Container(
                                        content=ft.Column(
                                            [
                                                ft.Text("Model and data", theme_style=ft.TextThemeStyle.TITLE_MEDIUM),
                                                ft.Divider(),
                                                model_name_field,
                                                ft.Row(
                                                    [
                                                        data_dir_path,
                                                        ft.ElevatedButton(
                                                            "Select dataset",
                                                            icon=ft.Icons.FOLDER_OPEN,
                                                            on_click=lambda _: file_picker.get_directory_path(
                                                                dialog_title="Select dataset directory"
                                                            ),
                                                            bgcolor=ft.Colors.GREY_800,
                                                            color=ft.Colors.WHITE,
                                                            style=beside_button_style,
                                                            expand=1,
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
                                                            "Set save path",
                                                            icon=ft.Icons.SAVE,
                                                            on_click=lambda _: save_file_picker.save_file(
                                                                dialog_title="Save model as..."
                                                            ),
                                                            bgcolor=ft.Colors.GREY_800,
                                                            color=ft.Colors.WHITE,
                                                            style=beside_button_style,
                                                            expand=1,
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
                                                            "Select model file",
                                                            icon=ft.Icons.UPLOAD_FILE,
                                                            on_click=lambda _: load_file_picker.pick_files(
                                                                dialog_title="Load model from...", allow_multiple=False
                                                            ),
                                                            bgcolor=ft.Colors.GREY_800,
                                                            color=ft.Colors.WHITE,
                                                            style=beside_button_style,
                                                            expand=1,
                                                            height=BUTTON_HEIGHT,
                                                        ),
                                                    ],
                                                    spacing=10,
                                                    vertical_alignment=ft.CrossAxisAlignment.CENTER,
                                                ),
                                                ft.Row(
                                                    [
                                                        ft.Text("Strictly enforce model keys on load", expand=True),
                                                        strict_load_switch,
                                                    ],
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
                                                ft.Text("Optimiser Settings", theme_style=ft.TextThemeStyle.TITLE_MEDIUM),
                                                ft.Divider(),
                                                ft.Row([sgd_momentum_field, adam_beta1_field], spacing=10),
                                                ft.Row([adam_beta2_field, adam_eps_field], spacing=10),
                                                weight_decay_field,
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
                            ),
                            ft.Container(
                                content=ft.Card(
                                    content=ft.Container(
                                        content=ft.Column(
                                            [
                                                ft.Text("Normalisation and Loss", theme_style=ft.TextThemeStyle.TITLE_MEDIUM),
                                                ft.Divider(),
                                                loss_function_dropdown,
                                                label_smoothing_factor_field,
                                                ft.Row(
                                                    [
                                                        ft.Text("Use ImageNet Normalisation", expand=True),
                                                        use_imagenet_norm_switch,
                                                    ],
                                                    vertical_alignment=ft.CrossAxisAlignment.CENTER,
                                                ),
                                                norm_mean_field,
                                                norm_std_field,
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
                            ),
                            ft.Container(
                                content=ft.Card(
                                    content=ft.Container(
                                        content=ft.Column(
                                            [
                                                ft.Text("Hyperparameters", theme_style=ft.TextThemeStyle.TITLE_MEDIUM),
                                                ft.Divider(),
                                                epochs_field,
                                                batch_size_field,
                                                learning_rate_field,
                                                input_size_field,
                                                resize_size_field,
                                                num_workers_field,
                                                dropout_rate_field,
                                                optimiser_dropdown,
                                                ft.Divider(),
                                                ft.Row(
                                                    [
                                                        ft.Text("Train from scratch", expand=True),
                                                        train_from_scratch_switch,
                                                    ],
                                                    vertical_alignment=ft.CrossAxisAlignment.CENTER,
                                                ),
                                                ft.Row(
                                                    [
                                                        ft.Text("Mixed Precision (AMP)", expand=True),
                                                        mixed_precision_switch,
                                                    ],
                                                    vertical_alignment=ft.CrossAxisAlignment.CENTER,
                                                ),
                                                ft.Row(
                                                    [
                                                        ft.Text("Pin Memory (CUDA)", expand=True),
                                                        pin_memory_switch,
                                                    ],
                                                    vertical_alignment=ft.CrossAxisAlignment.CENTER,
                                                ),
                                                ft.Row(
                                                    [
                                                        ft.Text("Early Stopping", expand=True),
                                                        early_stopping_switch,
                                                    ],
                                                    vertical_alignment=ft.CrossAxisAlignment.CENTER,
                                                ),
                                                ft.Row(
                                                    [
                                                        early_stopping_patience_field,
                                                        early_stopping_min_delta_field,
                                                    ],
                                                    spacing=10,
                                                ),
                                                early_stopping_metric_dropdown,
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
                            ),
                            ft.Container(
                                content=ft.Card(
                                    content=ft.Container(
                                        content=ft.Column(
                                            [
                                                ft.Text("Advanced Settings", theme_style=ft.TextThemeStyle.TITLE_MEDIUM),
                                                ft.Divider(),
                                                ft.Row(
                                                    [
                                                        ft.Text("Load truncated images", expand=True),
                                                        load_truncated_images_switch,
                                                    ],
                                                    vertical_alignment=ft.CrossAxisAlignment.CENTER,
                                                ),
                                            ],
                                            spacing=10,
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
                                                ft.Text("Data Augmentation", theme_style=ft.TextThemeStyle.TITLE_MEDIUM),
                                                ft.Divider(),
                                                ft.Row(
                                                    [
                                                        ft.Text("Random Crop and Zoom", expand=True),
                                                        aug_random_resized_crop_switch,
                                                    ],
                                                    vertical_alignment=ft.CrossAxisAlignment.CENTER,
                                                ),
                                                ft.Row(
                                                    [
                                                        aug_crop_scale_min_field,
                                                        aug_crop_scale_max_field,
                                                    ],
                                                    spacing=10,
                                                ),
                                                ft.Row(
                                                    [
                                                        aug_crop_ratio_min_field,
                                                        aug_crop_ratio_max_field,
                                                    ],
                                                    spacing=10,
                                                ),
                                                ft.Row(
                                                    [
                                                        ft.Text("Random Horizontal Flip", expand=True),
                                                        aug_horizontal_flip_switch,
                                                    ],
                                                    vertical_alignment=ft.CrossAxisAlignment.CENTER,
                                                ),
                                                ft.Row(
                                                    [
                                                        ft.Text("Random Rotation", expand=True),
                                                        aug_rotation_switch,
                                                    ],
                                                    vertical_alignment=ft.CrossAxisAlignment.CENTER,
                                                ),
                                                aug_rotation_degrees_field,
                                                ft.Row(
                                                    [
                                                        ft.Text("Random Brightness/Contrast", expand=True),
                                                        aug_color_jitter_switch,
                                                    ],
                                                    vertical_alignment=ft.CrossAxisAlignment.CENTER,
                                                ),
                                                ft.Row(
                                                    [
                                                        aug_color_jitter_brightness_field,
                                                        aug_color_jitter_contrast_field,
                                                    ],
                                                    spacing=10,
                                                ),
                                                ft.Row(
                                                    [
                                                        aug_color_jitter_saturation_field,
                                                        aug_color_jitter_hue_field,
                                                    ],
                                                    spacing=10,
                                                ),
                                                ft.Divider(),
                                                ft.Row(
                                                    [
                                                        finetune_seed_field,
                                                        ft.ElevatedButton(
                                                            "Generate",
                                                            icon=ft.Icons.CASINO,
                                                            on_click=generate_finetune_seed,
                                                            bgcolor=ft.Colors.GREY_800,
                                                            color=ft.Colors.WHITE,
                                                            style=beside_button_style,
                                                            expand=1,
                                                            height=BUTTON_HEIGHT,
                                                        ),
                                                    ],
                                                    spacing=10,
                                                ),
                                            ],
                                            spacing=10,
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
                                                ft.Text("Training", theme_style=ft.TextThemeStyle.TITLE_MEDIUM),
                                                ft.Divider(),
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
                        spacing=10,
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
        "train_ratio_field": train_ratio_field, "val_ratio_field": val_ratio_field, "test_ratio_field": test_ratio_field, "resolution_field": resolution_field, "process_seed_field": process_seed_field,
        "image_extensions_field": image_extensions_field, "color_mode_dropdown": color_mode_dropdown, "overwrite_dest_switch": overwrite_dest_switch,
        "data_dir_path": data_dir_path, "save_model_path": save_model_path, "load_model_path": load_model_path,
        "model_name_field": model_name_field, "epochs_field": epochs_field,
        "batch_size_field": batch_size_field, "learning_rate_field": learning_rate_field,
        "input_size_field": input_size_field, "resize_size_field": resize_size_field, "num_workers_field": num_workers_field,
        "train_from_scratch_switch": train_from_scratch_switch,
        "strict_load_switch": strict_load_switch,
        "dropout_rate_field": dropout_rate_field, "optimiser_dropdown": optimiser_dropdown,
        "sgd_momentum_field": sgd_momentum_field, "adam_beta1_field": adam_beta1_field, "adam_beta2_field": adam_beta2_field, "adam_eps_field": adam_eps_field, "weight_decay_field": weight_decay_field,
        "loss_function_dropdown": loss_function_dropdown, "label_smoothing_factor_field": label_smoothing_factor_field,
        "use_imagenet_norm_switch": use_imagenet_norm_switch, "norm_mean_field": norm_mean_field, "norm_std_field": norm_std_field,
        "load_truncated_images_switch": load_truncated_images_switch,
        "mixed_precision_switch": mixed_precision_switch,
        "pin_memory_switch": pin_memory_switch,
        "early_stopping_switch": early_stopping_switch, "early_stopping_patience_field": early_stopping_patience_field, "early_stopping_min_delta_field": early_stopping_min_delta_field, "early_stopping_metric_dropdown": early_stopping_metric_dropdown,
        "finetune_seed_field": finetune_seed_field,
        "aug_random_resized_crop_switch": aug_random_resized_crop_switch,
        "aug_crop_scale_min_field": aug_crop_scale_min_field, "aug_crop_scale_max_field": aug_crop_scale_max_field, "aug_crop_ratio_min_field": aug_crop_ratio_min_field, "aug_crop_ratio_max_field": aug_crop_ratio_max_field,
        "aug_horizontal_flip_switch": aug_horizontal_flip_switch,
        "aug_rotation_switch": aug_rotation_switch, "aug_rotation_degrees_field": aug_rotation_degrees_field,
        "aug_color_jitter_switch": aug_color_jitter_switch, "aug_color_jitter_brightness_field": aug_color_jitter_brightness_field, "aug_color_jitter_contrast_field": aug_color_jitter_contrast_field, "aug_color_jitter_saturation_field": aug_color_jitter_saturation_field, "aug_color_jitter_hue_field": aug_color_jitter_hue_field,
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
            
            # Manually trigger UI updates for controls with dependencies
            toggle_norm_fields(None)
            toggle_label_smoothing_field(None)
            
            page.update()

    for control in controls_to_save.values():
        control.on_change = save_inputs
    
    use_imagenet_norm_switch.on_change = toggle_norm_fields
    loss_function_dropdown.on_change = toggle_label_smoothing_field

    load_inputs()

    page.add(
        tabs
    )
    page.update()

if __name__ == "__main__":
    ft.app(target=main)
