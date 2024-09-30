package eave.videoclipper.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.FileNotFoundException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

@RestController
@RequestMapping("videos")
public class VideoController {
    private static final Logger LOGGER = LoggerFactory.getLogger(VideoController.class);

    @Value("${eave.videoclipper.videos-location}")
    private String videosDataPath;

    @GetMapping("{id}")
    public ResponseEntity<byte[]> get(@PathVariable String id) {
        try (Stream<Path> list = Files.list(Path.of(videosDataPath))) {
            Path videoPath = list.filter(path -> !Files.isDirectory(path))
                    .filter(path -> path.getFileName().toString().equals(id))
                    .findAny()
                    .orElseThrow(() -> new FileNotFoundException(id));

            byte[] bytes = Files.readAllBytes(videoPath);
            return ResponseEntity.status(200)
                    .contentType(MediaType.valueOf("video/mp4"))
                    .body(bytes);
        } catch (Exception exception) {
            LOGGER.error(exception.getMessage(), exception);
            throw new IllegalStateException(exception);
        }
    }

    @PostMapping("{id}")
    public void post(@PathVariable String id, @RequestBody byte[] video) {
        try {
            Files.write(Path.of(videosDataPath + "/" + id), video);
        } catch (Exception exception) {
            LOGGER.error(exception.getMessage(), exception);
            throw new IllegalStateException(exception);
        }
    }
}