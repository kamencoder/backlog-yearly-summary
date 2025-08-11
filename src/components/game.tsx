import { Box, Button, Card, CardContent, CardMedia, IconButton, Menu, MenuItem, Modal, Stack, Typography, TextField, Rating, type Theme, Chip } from "@mui/material";
import { getPlayTimeInHours, type SummaryGameInfo } from "../data/summarizer";
import { MoreVert, Search } from "@mui/icons-material";
import { useContext, useState } from "react";
import { DataContext, type GameEdit } from "../data/DataContext";

export interface GameProps {
  game: SummaryGameInfo;
}

export const Game = (props: GameProps) => {
  const { game } = props;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [menuElement, setMenuElement] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuElement);
  const [coverImage, setCoverImage] = useState(game.coverImage);
  const { editGame } = useContext(DataContext);
  const { data } = useContext(DataContext);
  const { viewSettings } = data.userData;


  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuElement(event.currentTarget);
  };
  const handleMenuClose = () => {
    setMenuElement(null);
  };

  const handleEditModalClose = () => setEditModalOpen(false);

  const onEditClick = () => {
    handleMenuClose();
    setEditModalOpen(true);
  }

  const onSave = () => {
    setEditModalOpen(false);
    const edit: GameEdit = {
      coverImage
    }
    editGame(game.id, edit);
  }

  const styles = {
    gameCard: (theme: Theme) => ({
      flex: 'auto',
      height: '100%',
      maxWidth: '180px',
      [theme.breakpoints.down('sm')]: {
        maxWidth: '98px',
      }
    }),
    gameCoverImage: (theme: Theme) => ({
      aspectRatio: 3 / 4,
      height: "240px",
      [theme.breakpoints.down('sm')]: {
        height: '130px'
      },
    }),
    gameCoverImageTextPlaceholder: (theme: Theme) => ({
      fontSize: "24px",
      overflow: "hidden",
      wordWrap: "break-word",
      [theme.breakpoints.down('sm')]: {
        fontSize: "14px",
      }
    }),
    gameCardContent: {
      padding: "6px",
      "&:last-child": { paddingBottom: "10px" }
    },
    gameEditModal: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,
      bgcolor: 'background.paper',
      border: '2px solid #000',
      boxShadow: 24,
      p: 4,
    }
  };


  return (
    <>

      <Card sx={styles.gameCard} >
        {game.coverImage && <CardMedia
          sx={styles.gameCoverImage}
          image={game.coverImage || ''}
        />
        }
        <CardContent sx={styles.gameCardContent}>
          {!game.coverImage && (
            <Box sx={styles.gameCoverImage} justifyContent="center" display="flex" flexDirection="column" textAlign="center">
              <Typography variant="body1" fontWeight="bold" sx={styles.gameCoverImageTextPlaceholder}>
                {game.title}
              </Typography>
            </Box>
          )}
          <Box display="flex">
            <Stack flex="1">
              <Typography variant="body2">
                {game.platformAbbreviation}{game.releaseYear ? ` - ${game.releaseYear}` : ''}
              </Typography>
              {viewSettings.showPlaytimeStats && (
                <Typography variant="body2">
                  {!game.playTime ? '⠀' : getPlayTimeInHours(game.playTime, 1) + ((game.playTime || 0) > 1 ? ' hrs' : ' hr')}
                </Typography>
              )}
              <Rating size={"small"} name="game-rating" value={game.rating} precision={0.5} readOnly />
            </Stack>
            <Stack height={"100%"} alignSelf={"end"} gap={"2px"}>
              {game.completion === "Completed" && <Chip label="100%" size="small" color="info" sx={{ fontWeight: 700 }} />}
              <IconButton id={`edit-game-${game.id}`} onClick={handleMenuClick} size="small" sx={{ maxHeight: "2em", alignSelf: 'flex-end' }}><MoreVert /></IconButton>
            </Stack>
            <Menu
              anchorEl={menuElement}
              open={menuOpen}
              onClose={handleMenuClose}
              slotProps={{
                list: {
                  'aria-labelledby': `edit-game-${game.id}`,
                },
              }}
            >
              <MenuItem onClick={onEditClick}>Edit</MenuItem>
              <MenuItem disabled={true} onClick={onEditClick}>Game of the Month (WIP)</MenuItem>
            </Menu>
          </Box>
        </CardContent>
      </Card>
      <Modal
        open={editModalOpen}
        onClose={handleEditModalClose}
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
      >
        <Box sx={styles.gameEditModal} display="flex" flexDirection="column" gap="10px">
          <Typography variant="h4" id="edit-modal-title">Edit</Typography>
          <Box sx={{ minHeight: "150px" }}>
            <Box display="flex">
              <TextField sx={{ flex: '1' }} label="Cover Image" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} ></TextField>
              <IconButton onClick={() => {
                window.open(`https://www.igdb.com/search?utf8=%E2%9C%93&q=${encodeURI(game.title)}`, '_blank')
              }}><Search /></IconButton>
            </Box>
          </Box>
          <Button variant="contained" onClick={onSave} sx={{ maxWidth: "100px", alignSelf: "flex-end" }}>
            Save
          </Button>
        </Box>
      </Modal>

    </>


  );
}