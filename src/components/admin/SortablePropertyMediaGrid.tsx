import { useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export type SortablePropertyMedia = {
  id: string;
  storage_path: string;
  alt_text: string | null;
  position: number;
  is_cover: boolean;
  media_type: 'photo' | 'floorplan';
};

type SortablePropertyMediaGridProps = {
  items: SortablePropertyMedia[];
  variant: 'photo' | 'floorplan';
  propertyTitle: string;
  disabled: boolean;
  getImageUrl: (storagePath: string) => string;
  onReorder: (orderedItems: SortablePropertyMedia[]) => void;
  onMove: (
    imageIndex: number,
    direction: -1 | 1,
    mediaItems: SortablePropertyMedia[],
  ) => void;
  onSetCover: (imageId: string) => void;
  onDelete: (image: SortablePropertyMedia) => void;
};

type SortableMediaCardProps = Omit<
  SortablePropertyMediaGridProps,
  'items' | 'onReorder' | 'onMove'
> & {
  image: SortablePropertyMedia;
  index: number;
  itemCount: number;
  onMove: (imageIndex: number, direction: -1 | 1) => void;
};

function DragHandle({
  label,
  disabled,
  setActivatorNodeRef,
  attributes,
  listeners,
}: {
  label: string;
  disabled: boolean;
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  attributes: ReturnType<typeof useSortable>['attributes'];
  listeners: ReturnType<typeof useSortable>['listeners'];
}) {
  return (
    <button
      type="button"
      className="admin-media-drag-handle"
      ref={setActivatorNodeRef}
      disabled={disabled}
      aria-label={label}
      title={label}
      {...attributes}
      {...listeners}
    >
      <span aria-hidden="true">⠿</span>
    </button>
  );
}

function SortableMediaCard({
  image,
  index,
  itemCount,
  variant,
  propertyTitle,
  disabled,
  getImageUrl,
  onMove,
  onSetCover,
  onDelete,
}: SortableMediaCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id, disabled });
  const label = image.alt_text ??
    (variant === 'photo'
      ? propertyTitle
      : `Plano ${index + 1} de ${propertyTitle}`);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const dragHandle = (
    <DragHandle
      label={`Arrastrar ${variant === 'photo' ? 'fotografía' : 'plano'} de la posición ${index + 1}`}
      disabled={disabled}
      setActivatorNodeRef={setActivatorNodeRef}
      attributes={attributes}
      listeners={listeners}
    />
  );

  if (variant === 'floorplan') {
    return (
      <article
        ref={setNodeRef}
        style={style}
        className={isDragging ? 'is-dragging' : undefined}
      >
        <div className="admin-floorplan-card__media">
          <img src={getImageUrl(image.storage_path)} alt={label} loading="lazy" />
          {dragHandle}
        </div>
        <div>
          <span>Plano {index + 1}</span>
          <span>
            <button
              type="button"
              onClick={() => onMove(index, -1)}
              disabled={disabled || index === 0}
              aria-label={`Subir plano ${index + 1}`}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => onMove(index, 1)}
              disabled={disabled || index === itemCount - 1}
              aria-label={`Bajar plano ${index + 1}`}
            >
              ↓
            </button>
            <button type="button" onClick={() => onDelete(image)} disabled={disabled}>
              Eliminar
            </button>
          </span>
        </div>
      </article>
    );
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`admin-image-card${isDragging ? ' is-dragging' : ''}`}
    >
      <div className="admin-image-card__media">
        <img src={getImageUrl(image.storage_path)} alt={label} loading="lazy" />
        {image.is_cover ? (
          <span className="admin-image-card__cover">PORTADA</span>
        ) : null}
        {dragHandle}
      </div>

      <div className="admin-image-card__actions">
        <span>Posición {index + 1}</span>
        <div>
          <button
            type="button"
            onClick={() => onMove(index, -1)}
            disabled={disabled || index === 0}
            aria-label={`Subir posición de ${label}`}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 1)}
            disabled={disabled || index === itemCount - 1}
            aria-label={`Bajar posición de ${label}`}
          >
            ↓
          </button>
        </div>
        <button
          type="button"
          onClick={() => onSetCover(image.id)}
          disabled={disabled || image.is_cover}
        >
          {image.is_cover ? 'Es la portada' : 'Hacer portada'}
        </button>
        <button type="button" onClick={() => onDelete(image)} disabled={disabled}>
          Eliminar
        </button>
      </div>
    </article>
  );
}

export function SortablePropertyMediaGrid({
  items,
  variant,
  propertyTitle,
  disabled,
  getImageUrl,
  onReorder,
  onMove,
  onSetCover,
  onDelete,
}: SortablePropertyMediaGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);

    if (disabled || !over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  const moveItem = (
    imageIndex: number,
    direction: -1 | 1,
  ) => onMove(imageIndex, direction, items);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      autoScroll={{
        threshold: { x: 0.15, y: 0.15 },
        acceleration: 8,
        interval: 10,
      }}
      onDragStart={({ active }) => setActiveId(String(active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={rectSortingStrategy}
      >
        <div
          className={
            variant === 'photo'
              ? 'admin-images__grid'
              : 'admin-floorplans-editor__grid'
          }
          aria-busy={disabled}
          data-dragging={activeId ? 'true' : undefined}
        >
          {items.map((image, index) => (
            <SortableMediaCard
              key={image.id}
              image={image}
              index={index}
              itemCount={items.length}
              variant={variant}
              propertyTitle={propertyTitle}
              disabled={disabled}
              getImageUrl={getImageUrl}
              onMove={moveItem}
              onSetCover={onSetCover}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
