"use client"

import { useState, useRef } from "react"
import { Loader2, Plus, Minus, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { processFeatures, processImage } from "@/app/actions"
import { cn } from "@/lib/utils"

export function UserInputForm() {
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [inputMethod, setInputMethod] = useState("manual")
  const [features, setFeatures] = useState([0, 0, 0, 0])
  const [jsonInput, setJsonInput] = useState('{"features": [0, 0, 0, 0]}')
  const [jsonError, setJsonError] = useState("")
  const fileInputRef = useRef(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [useAdvancedOptions, setUseAdvancedOptions] = useState(false)
  const [threshold, setThreshold] = useState(0.5)

  const addFeature = () => {
    setFeatures([...features, 0])
  }

  const removeFeature = (index) => {
    if (features.length > 1) {
      const newFeatures = [...features]
      newFeatures.splice(index, 1)
      setFeatures(newFeatures)
    }
  }

  const updateFeature = (index, value) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  const handleJsonChange = (value) => {
    setJsonInput(value)
    try {
      const parsed = JSON.parse(value)
      if (!parsed.features || !Array.isArray(parsed.features)) {
        setJsonError("JSON must contain a 'features' array")
      } else if (!parsed.features.every((f) => typeof f === "number")) {
        setJsonError("All elements in 'features' must be numbers")
      } else {
        setJsonError("")
      }
    } catch (e) {
      setJsonError("Invalid JSON format")
    }
  }

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async () => {
    setIsLoading(true)
    try {
      let data = null

      if (inputMethod === "manual") {
        data = await processFeatures({
          features,
          options: useAdvancedOptions ? { threshold } : undefined,
        })
      } else if (inputMethod === "json") {
        try {
          const parsed = JSON.parse(jsonInput)
          data = await processFeatures({
            features: parsed.features,
            options: useAdvancedOptions ? { threshold } : undefined,
          })
        } catch (e) {
          setJsonError("Failed to parse JSON")
          setIsLoading(false)
          return
        }
      } else if (inputMethod === "image" && selectedImage) {
        data = await processImage({
          image: selectedImage,
          options: useAdvancedOptions ? { threshold } : undefined,
        })
      }

      setResults(data)
    } catch (err) {
      console.error("Error processing data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="overflow-hidden border-2 p-1 md:sticky md:top-20 md:h-fit">
        <CardContent className="p-5">
          <h3 className="mb-4 text-xl font-semibold">Input Features</h3>

          <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual">Manual Input</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="image">Image Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="mt-4 space-y-6">
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <label className="w-24 text-right text-sm font-medium">Feature {index + 1}</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={feature}
                      onChange={(e) => updateFeature(index, parseFloat(e.target.value) || 0)}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeFeature(index)}
                      disabled={features.length <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button type="button" variant="outline" size="sm" onClick={addFeature} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="json" className="mt-4 space-y-4">
              <label className="text-sm font-medium">JSON Input</label>
              <textarea
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder='{"features": [0.5, 0.1, -0.3, 0.2]}'
              />
              {jsonError && <p className="text-sm text-destructive">{jsonError}</p>}
              <p className="text-sm text-muted-foreground">
                Enter a JSON object with a "features" array containing numeric values.
              </p>
            </TabsContent>

            <TabsContent value="image" className="mt-4 space-y-4">
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
                  previewUrl ? "border-primary/50" : "border-muted-foreground/25 hover:border-muted-foreground/50"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <div className="relative w-full">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mx-auto max-h-[200px] rounded-md object-contain"
                    />
                    <p className="mt-2 text-center text-sm text-muted-foreground">{selectedImage?.name}</p>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground" />
                    <p className="mb-1 text-sm font-medium">Click to upload an image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (max. 5MB)</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="advanced-options" checked={useAdvancedOptions} onCheckedChange={setUseAdvancedOptions} />
              <label htmlFor="advanced-options" className="text-sm font-medium">
                Advanced Options
              </label>
            </div>

            {useAdvancedOptions && (
              <div className="space-y-4 rounded-md border p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Threshold</label>
                    <span className="text-sm text-muted-foreground">{threshold}</span>
                  </div>
                  <Slider
                    value={[threshold]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(values) => setThreshold(values[0])}
                  />
                  <p className="text-sm text-muted-foreground">Adjust the sensitivity threshold for processing.</p>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={onSubmit}
            className="mt-6 w-full"
            disabled={
              isLoading || (inputMethod === "image" && !selectedImage) || (inputMethod === "json" && !!jsonError)
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Process Data"
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card className={`border-2 ${!results ? "border-dashed" : ""}`}>
          <CardContent
            className={`p-6 ${!results ? "flex flex-col items-center justify-center min-h-[300px] text-center" : ""}`}
          >
            {results ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Results</h3>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>
                  <TabsContent value="summary" className="mt-4 space-y-4">
                    <div className="rounded-lg bg-muted p-4">
                      <h4 className="mb-2 font-medium">Prediction</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold">{results.prediction.label}</span>
                        <span className="text-xl font-medium">{(results.prediction.confidence * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-muted p-4">
                        <h5 className="text-sm font-medium">Processing Time</h5>
                        <p className="text-2xl font-bold">{results.metadata.processingTime}ms</p>
                      </div>
                      <div className="rounded-lg bg-muted p-4">
                        <h5 className="text-sm font-medium">Model</h5>
                        <p className="text-lg font-bold">{results.metadata.model}</p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="details" className="mt-4">
                    <div className="space-y-4">
                      <div className="rounded-lg bg-muted p-4">
                        <h4 className="mb-2 font-medium">Feature Importance</h4>
                        <div className="space-y-2">
                          {results.analysis.featureImportance.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span>Feature {item.feature}</span>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-24 overflow-hidden rounded-full bg-muted-foreground/20">
                                  <div
                                    className="h-full bg-primary"
                                    style={{ width: `${item.importance * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm">{(item.importance * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted p-4">
                        <h4 className="mb-2 font-medium">Raw Output</h4>
                        <pre className="max-h-[200px] overflow-auto rounded bg-muted-foreground/10 p-2 text-xs">
                          {JSON.stringify(results.rawOutput, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <>
                <div className="mb-4 rounded-full bg-muted p-3 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 16h5v5" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium">Your results will appear here</h3>
                <p className="text-muted-foreground">Submit your features or image to see the prediction results</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
