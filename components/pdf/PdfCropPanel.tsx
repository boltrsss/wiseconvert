"use client";

type Crop = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type Props = {
  value: Crop;
  onChange: (c: Crop) => void;
  pageWidth: number;
  pageHeight: number;
};

export default function PdfCropPanel({
  value,
  onChange,
  pageWidth,
  pageHeight,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      {(["x", "y", "w", "h"] as const).map((k) => (
        <div key={k}>
          <label className="block mb-1 uppercase">{k}</label>
          <input
            type="number"
            className="border rounded px-2 py-1 w-full"
            value={value[k]}
            onChange={(e) =>
              onChange({ ...value, [k]: Number(e.target.value) })
            }
          />
        </div>
      ))}

      <div className="col-span-2">
        <button
          type="button"
          className="text-xs underline text-slate-600"
          onClick={() =>
            onChange({
              x: 0,
              y: 0,
              w: pageWidth,
              h: pageHeight,
            })
          }
        >
          Reset area
        </button>
      </div>
    </div>
  );
}
