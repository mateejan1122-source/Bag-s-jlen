
$file = "pages\HomeSplit.tsx"
$content = [System.IO.File]::ReadAllText((Resolve-Path $file))

# ─── Fix 1: News Section – wrap in full-width white background div ───────────
$oldNews = '{/* News Section */}
      <section className="px-6 md:px-20 py-20 md:py-32 max-w-[1440px] mx-auto w-full bg-white text-left" style={{ backgroundColor: newsVisual.backgroundColor, paddingTop: toPx(newsVisual.paddingTop), paddingBottom: toPx(newsVisual.paddingBottom) }}>'

$newNews = '{/* News Section */}
      <div className="w-full" style={{ backgroundColor: newsVisual.backgroundColor || "#FFFFFF" }}>
      <section className="px-6 md:px-20 py-20 md:py-32 max-w-[1440px] mx-auto w-full text-left" style={{ paddingTop: toPx(newsVisual.paddingTop), paddingBottom: toPx(newsVisual.paddingBottom) }}>'

# Find the closing tag of the news section to add the closing div
$oldNewsClose = '      </section>

      {/* Booking Section */}'
$newNewsClose = '      </section>
      </div>

      {/* Booking Section */}'

if ($content.Contains($oldNews.Replace("`r`n", "`n"))) {
    $content = $content.Replace($oldNews.Replace("`r`n", "`n"), $newNews.Replace("`r`n", "`n"))
    Write-Host "Fix 1a applied (LF): News section opening"
} elseif ($content.Contains($oldNews.Replace("`n", "`r`n"))) {
    $content = $content.Replace($oldNews.Replace("`n", "`r`n"), $newNews.Replace("`n", "`r`n"))
    Write-Host "Fix 1a applied (CRLF): News section opening"
} else {
    Write-Host "Fix 1a NOT found - trying substring search"
    $idx = $content.IndexOf("{/* News Section */}")
    if ($idx -ge 0) {
        Write-Host "Found News Section comment at index $idx"
        $snippet = $content.Substring($idx, [Math]::Min(300, $content.Length - $idx))
        Write-Host "Snippet: $snippet"
    }
}

if ($content.Contains($oldNewsClose.Replace("`r`n", "`n"))) {
    $content = $content.Replace($oldNewsClose.Replace("`r`n", "`n"), $newNewsClose.Replace("`r`n", "`n"))
    Write-Host "Fix 1b applied (LF): News section closing"
} elseif ($content.Contains($oldNewsClose.Replace("`n", "`r`n"))) {
    $content = $content.Replace($oldNewsClose.Replace("`n", "`r`n"), $newNewsClose.Replace("`n", "`r`n"))
    Write-Host "Fix 1b applied (CRLF): News section closing"
} else {
    Write-Host "Fix 1b NOT found"
}

# ─── Fix 2: Mobile buttons – hero buttons already use flex-col sm:flex-row, good ─
# The confirmation step buttons on line 1167 need flex-wrap
$oldConfirmButtons = '              <div className="flex flex-col sm:flex-row gap-4">'
$newConfirmButtons = '              <div className="flex flex-wrap gap-4">'

if ($content.Contains($oldConfirmButtons)) {
    $content = $content.Replace($oldConfirmButtons, $newConfirmButtons)
    Write-Host "Fix 2 applied: Confirmation step buttons made flex-wrap"
} else {
    Write-Host "Fix 2 NOT found"
}

[System.IO.File]::WriteAllText((Resolve-Path $file), $content, [System.Text.Encoding]::UTF8)
Write-Host "File saved successfully."
